# -*- coding: utf-8 -*-
"""采集出版方撰写的报道文本，产出 src/data/source-texts.json。

为什么要有这个脚本
------------------
卡片上显示的摘要，以及两条判定管线读到的报道文本，都必须是**出版方自己写的**，
不能是本项目撰写的。卡片挂着真实署名，一段由我们撰写的摘要安在出版方名下，
是完整性问题，不是措辞问题；而让模型去读另一个模型写的文本再打分，本身也说明
不了什么。出版方已经写好了：og:description 就是他们给社交预览准备的摘要。

原文从 **Wayback 带时间戳的快照**取，不从当前线上页面取：线上页面会改、会下线，
论文里「每条可追溯至带时间戳的存档快照」这句话必须真的成立。取 id_ 形式的
原样快照，避免存档站自身注入的工具栏混进正文。

槽位模型
--------
抓到什么填什么，空的留空，不做二选一：

    ogTitle / ogDescription / metaDescription / ogImage / lede / body

判定输入的深度因此是**被记录的结果**而不是预先设定的档位——哪些槽位非空就是
哪一层。回退顺序 og:description → 首段 → 仅标题 是 Open Graph 协议加聚合器
解析链接预览的既有顺序，不是为这批数据发明的。

正文抽取
--------
不是「把所有 <p> 拿出来」。那样抓到的是导航栏、订阅弹窗、编辑守则声明——上一版
实测 36 条里超过 20 条的首段是这类站点样板。这里按可读性文献的通行做法做两步：

  ① 先在树上标记非正文容器（script/style/nav/header/footer/aside/form/figure…），
     其中的段落一律不取
  ② 再给剩下的段落按容器打分——每段的分数记给父、祖父、曾祖父，权重递减——
     取得分最高的容器作为正文所在，取它底下的全部段落

好处是**与站点无关**：导航与正文本来就不在同一个容器里，不必为每家媒体写规则。
剩下少量粘在正文首段里的版式碎片（WaPo 的阅读时长与署名条）用一份写明出处的
前缀清单剥掉，清单就在下面，改了能看见。

用法
    python scripts/harvest-source-texts.py [输出路径]
默认输出 src/data/source-texts.json。可反复重跑；重跑会覆盖输出文件。
⚠️ 输出文件的内容哈希进两条管线的 meta，跑过判定之后再重采就无法续跑，
   只能整体重跑（见 scripts/annotate/README.md）。
"""

import datetime
import gzip
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
import zlib
from html.parser import HTMLParser

try:                       # Wayback 会原样回放当年的 Content-Encoding，其中有 br
    import brotli          # 可选依赖；装了就多救回几条，没装就如实记成取不到
except ImportError:
    brotli = None

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_DATA = os.path.join(REPO_ROOT, 'src', 'data', 'app-data.json')
DEFAULT_OUT = os.path.join(REPO_ROOT, 'src', 'data', 'source-texts.json')

UA = {'User-Agent': 'Mozilla/5.0 (research provenance harvest)'}

# 整棵剪掉的容器。正文不会长在这些标签里，而导航与推广几乎只长在这些标签里。
DROP_TAGS = {
    'script', 'style', 'noscript', 'svg', 'nav', 'header', 'footer', 'aside',
    'form', 'button', 'select', 'figure', 'figcaption', 'iframe', 'template',
}

# 粘在正文首段前面的版式碎片。逐条写明来自哪家，因为它们确实是站点特有的；
# 与上面的容器剪枝不同，这一份必须靠人看出来，所以留在这里让人能看见。
CHROME_PREFIXES = [
    re.compile(r'^\d+\s*min(?=[A-Z])'),           # WaPo 阅读时长「7 min」
    re.compile(r'^Make us preferred on Google'),   # WaPo 版式条
]

# 整段丢弃的站点样板。判据是「这段话在该站每一页都一样」，与报道内容无关。
CHROME_PARAGRAPHS = [
    'skip to main content',
    'accessibility links',
    'keyboard shortcuts for audio player',
    'our reporting on all platforms will be truthful',   # Texas Tribune 编辑守则
    'is a nonprofit, investigative newsroom',            # ProPublica 站点简介
    'connecting decision makers to a dynamic network',   # Bloomberg 公司简介
    'the best of the tribune in your inbox',             # Texas Tribune 订阅条
    'sign up for the weekly',                            # Grist 订阅条
    'we hand-package the week',                          # Grist 订阅条
]

# 同上，但按正则匹配。订阅推广的措辞各家不同、逐家列不完，而「以 Sign up for
# 开头、随后提到 newsletter」这个形状是通用的，正文段落几乎不会长成这样。
CHROME_PATTERNS = [
    re.compile(r'^sign up for .{0,140}newsletter', re.I),
]


class Node:
    __slots__ = ('tag', 'parent', 'text_len', 'link_len', 'dropped')

    def __init__(self, tag, parent=None):
        self.tag = tag
        self.parent = parent
        self.text_len = 0
        self.link_len = 0
        # 自身是非正文容器，或祖先里有一个——只判一次，往下继承
        self.dropped = bool(parent and parent.dropped) or tag in DROP_TAGS


class Tree(HTMLParser):
    """把 HTML 摊成一棵只保留结构与文本的树。

    不用第三方解析器：这个脚本要能在一台只有标准库的机器上复跑，而任务简单到
    自绘一棵树比引入依赖更划算。空元素不入栈，畸形结束标签靠 tag 匹配回退处理。
    """

    VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
            'link', 'meta', 'param', 'source', 'track', 'wbr'}

    # 这些标签不可能出现在 <p> 内部；碰到就说明上一个 <p> 已被隐式闭合。
    # HTML 允许省略 </p>，不补这一刀，一个 <p> 会吞掉之后的整篇正文。
    CLOSES_P = {'p', 'div', 'section', 'article', 'ul', 'ol', 'li', 'table',
                'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'main',
                'nav', 'header', 'footer', 'aside', 'figure', 'form'}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node('#root')
        self.cur = self.root
        self.texts = {}          # id(<p> 节点) -> [str]
        self.paragraphs = []     # 文档顺序的 <p> 节点（含被剪枝的，取用时再过滤）

    def handle_starttag(self, tag, attrs):
        if tag in self.VOID:
            return
        # 非正文容器**不再靠计数器跳过**。计数器要求标签严格配平，而真实页面
        # 里 <button>/<form> 内部常有不闭合的标签：计数一旦回不到零，之后的
        # 整篇正文都会被当成导航丢掉——PBS 那条就是这样丢了全文而毫无迹象。
        # 改成在树上标记，靠祖先链判断，配平与否都不影响。
        if tag in self.CLOSES_P:
            node = self.cur
            while node is not self.root and node.tag != 'p':
                node = node.parent
            if node is not self.root:
                self.cur = node.parent

        node = Node(tag, self.cur)
        self.cur = node
        if tag == 'p':
            self.texts[id(node)] = []
            self.paragraphs.append(node)

    def handle_endtag(self, tag):
        if tag in self.VOID:
            return
        # 往上找最近的同名祖先；找不到就当这个结束标签是多余的，忽略。
        node = self.cur
        while node is not self.root and node.tag != tag:
            node = node.parent
        if node is not self.root:
            self.cur = node.parent

    def handle_data(self, data):
        if not data.strip():
            return
        # <p> 里的文本记进该段；长度同时累加到所有祖先，供容器打分。
        holder = self.cur
        while holder is not self.root and holder.tag != 'p':
            holder = holder.parent
        if holder is not self.root:
            self.texts.setdefault(id(holder), []).append(data)

        size = len(data)
        in_link = False
        walk = self.cur
        while walk is not None:
            if walk.tag == 'a':
                in_link = True
            walk.text_len += size
            if in_link:
                walk.link_len += size
            walk = walk.parent


def paragraph_text(tree, node):
    raw = ' '.join(tree.texts.get(id(node), []))
    return re.sub(r'\s+', ' ', html.unescape(raw)).strip()


def usable(text, node):
    """一段文字要进正文，得先是散文。三条判据都与站点无关。"""
    if len(text.split()) < 15:
        return False
    if not re.search(r'[.!?]', text):                          # 无句末标点 = 标签串
        return False
    if node.text_len and node.link_len / node.text_len > 0.5:  # 链接过半 = 目录
        return False
    low = text.lower()
    if any(marker in low for marker in CHROME_PARAGRAPHS):
        return False
    return not any(pattern.search(text) for pattern in CHROME_PATTERNS)


def strip_chrome(text):
    changed = True
    while changed:
        changed = False
        for pattern in CHROME_PREFIXES:
            stripped = pattern.sub('', text).strip()
            if stripped != text:
                text, changed = stripped, True
    return text


def extract_paragraphs(source):
    """→ (正文段落, 被剔除的段落)。后者落盘留痕，供人核对剔对了没有。"""
    tree = Tree()
    try:
        tree.feed(source)
    except Exception:
        pass

    kept, dropped = [], []
    for node in tree.paragraphs:
        if node.dropped:
            continue
        text = strip_chrome(paragraph_text(tree, node))
        if not text:
            continue
        if usable(text, node):
            kept.append((node, text))
        else:
            dropped.append(text)

    if not kept:
        return [], dropped

    # 容器打分：每段的分数记给父、祖父、曾祖父，权重依次递减。
    # 只记直系父节点是不够的——不少站点给每一段各裹一层 div，那样每个容器
    # 都只得一段的分，最后会挑中「最长的那一段」而不是「正文所在的那一块」，
    # NPR 那条就因此只剩了访谈稿中间的一段。
    scores = {}
    holders = {}
    for node, text in kept:
        holder = node.parent
        for weight in (1.0, 0.5, 0.33):
            if holder is None or holder is tree.root:
                break
            scores[id(holder)] = scores.get(id(holder), 0) + len(text) * weight
            holders[id(holder)] = holder
            holder = holder.parent
    best = holders[max(scores, key=lambda key: scores[key])]

    def inside(node):
        walk = node.parent
        while walk is not None:
            if walk is best:
                return True
            walk = walk.parent
        return False

    body = [text for node, text in kept if inside(node)]
    outside = [text for node, text in kept if not inside(node)]
    return body, dropped + outside


def get(url, timeout=90):
    """取一个页面，返回解码后的文本。

    id_ 快照回放的是**当年的原始字节与原始响应头**，包括 Content-Encoding。
    上一版只认 gzip 的魔数，遇到 brotli 就把压缩字节按 UTF-8 强行解码，得到
    一大团乱码——而乱码里恰好有足够多的标点和空格，能骗过下游所有的散文判据，
    最后作为「正文」落盘。所以这里按响应头解压，并在最后加一道「这看起来像
    文本吗」的闸：宁可记成取不到，也不能把乱码当正文喂给判定。
    """
    request = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(request, timeout=timeout) as response:
        raw = response.read()
        encoding = (response.headers.get('Content-Encoding') or '').lower()

    if raw[:2] == b'\x1f\x8b' or 'gzip' in encoding:
        raw = gzip.decompress(raw)
    elif 'deflate' in encoding:
        raw = zlib.decompress(raw, -zlib.MAX_WBITS)
    elif 'br' in encoding:
        if brotli is None:
            raise ValueError('响应是 brotli 压缩的，但没装 brotli 包')
        raw = brotli.decompress(raw)

    text = raw.decode('utf-8', 'ignore')
    sample = text[:4000]
    if sample:
        printable = sum(1 for c in sample if c.isprintable() or c in ' \r\n\t')
        if printable / len(sample) < 0.9:
            raise ValueError('响应不像文本，可能是未识别的压缩格式')
    return text


QUOTE = '["\']'


def meta(source, name):
    """读 <meta> 的 content。

    引号必须用反向引用配对。上一版写的是「任一引号都收尾」，于是双引号包裹、
    内含撇号的 og 值会在撇号处被截断——实测 ICE 那条的 og:title 只剩「ICE」
    三个字母，而这个字段会一路流到卡片上。
    """
    patterns = (
        r'<meta[^>]+(?:property|name)=(%s)%s\1[^>]*?content=(%s)(.*?)\2'
        % (QUOTE, '%s', QUOTE),
        r'<meta[^>]+content=(%s)(.*?)\1[^>]*?(?:property|name)=(%s)%s\3'
        % (QUOTE, QUOTE, '%s'),
    )
    for index, pattern in enumerate(patterns):
        found = re.search(pattern % re.escape(name), source, re.I | re.S)
        if found:
            value = found.group(3) if index == 0 else found.group(2)
            return html.unescape(value).strip() or None
    return None


def harvest(url, backoff=(0, 10, 25, 50)):
    record = {
        'url': url, 'source': None, 'snapshot': None, 'snapshotAt': None,
        'ogTitle': None, 'ogDescription': None, 'metaDescription': None,
        'ogImage': None, 'lede': None, 'body': None,
        'paragraphCount': 0, 'bodyWords': 0,
        'harvestedAt': datetime.datetime.now().isoformat(timespec='seconds'),
    }

    last = len(backoff) - 1
    for attempt, delay in enumerate(backoff):
        if delay:
            time.sleep(delay)
        try:
            probe = ('https://archive.org/wayback/available?url='
                     + urllib.parse.quote(url, safe=''))
            snapshots = json.loads(get(probe, 30)).get('archived_snapshots', {})
            closest = snapshots.get('closest')
            if not closest or closest.get('status') != '200':
                # 空结果**要重试**，不能当成「存档上没有」。可用性接口在限流时
                # 返回的就是一个空的 archived_snapshots，与真的没有快照长得一样。
                # 上一版在这里直接 break，于是同一批 URL 两次采集给出不同的
                # 「只有标题」条数——而那个数字要写进论文的分层报告。
                if attempt < last:
                    continue
                break

            stamp = closest['timestamp']
            record['snapshot'] = 'https://web.archive.org/web/%sid_/%s' % (stamp, url)
            record['snapshotAt'] = stamp

            page = get(record['snapshot'])
            record['ogTitle'] = meta(page, 'og:title')
            record['ogDescription'] = meta(page, 'og:description')
            record['metaDescription'] = meta(page, 'description')
            record['ogImage'] = meta(page, 'og:image')

            body, dropped = extract_paragraphs(page)
            record['paragraphCount'] = len(body)
            if body:
                record['lede'] = body[0]
                record['body'] = '\n\n'.join(body)
                record['bodyWords'] = len(' '.join(body).split())
            if dropped:
                record['dropped'] = dropped
            break
        except Exception as error:
            if attempt == last:
                record['error'] = type(error).__name__
    return record


def main():
    out_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT
    with open(APP_DATA, encoding='utf-8') as handle:
        app_data = json.load(handle)

    out = {}
    for report in app_data['reports']:
        url = report.get('url')
        if not url:
            print('%-22s 无 URL，跳过' % report['id'], flush=True)
            continue
        time.sleep(1)   # 对存档站客气一点，也顺带压低被限流的概率
        record = harvest(url)
        record['source'] = report.get('source')
        out[report['id']] = record
        print('%-22s snap=%-9s og=%-3s img=%-3s paras=%-3d %5d words' % (
            report['id'], record['snapshotAt'] or '-',
            'Y' if record['ogDescription'] else 'n',
            'Y' if record['ogImage'] else 'n',
            record['paragraphCount'], record['bodyWords']), flush=True)

    # ── 补采 ──────────────────────────────────────────────────────────────
    #
    # 空手而归的条目再单独跑一轮，退避拉长。理由是存档站限流时返回的是一个
    # 空的 archived_snapshots，与「这个 URL 真的没被存过」返回的东西一模一样：
    # 不补这一轮，同一批 URL 两次采集会给出不同的「只有标题」条数，而那个数字
    # 要进论文的分层报告。真的没有快照的条目在补采里会照样失败——那才是结论。
    empty = [rid for rid, rec in out.items() if not rec['snapshot']]
    if empty:
        print('\n=== 补采 %d 条（首轮空手而归）===' % len(empty))
        for rid in empty:
            time.sleep(5)
            record = harvest(out[rid]['url'], backoff=(0, 30, 60, 120))
            if not record['snapshot']:
                print('%-22s 补采仍无快照 —— 判定为存档上确实没有' % rid, flush=True)
                continue
            record['source'] = out[rid]['source']
            out[rid] = record
            print('%-22s 补采成功 snap=%s paras=%d %d words'
                  % (rid, record['snapshotAt'], record['paragraphCount'],
                     record['bodyWords']), flush=True)

    with open(out_path, 'w', encoding='utf-8') as handle:
        json.dump(out, handle, ensure_ascii=False, indent=1)

    print('\n=== 汇总 ===')
    print('总条数            %d' % len(out))
    print('有 og:description %d' % sum(1 for v in out.values() if v['ogDescription']))
    print('有 og:image       %d' % sum(1 for v in out.values() if v['ogImage']))
    print('有正文            %d' % sum(1 for v in out.values() if v['body']))
    print('只有标题          %d' % sum(1 for v in out.values()
                                       if not v['ogDescription'] and not v['lede']))
    words = sorted(v['bodyWords'] for v in out.values() if v['bodyWords'])
    if words:
        print('正文词数 中位 %d  区间 %d–%d  合计 %d'
              % (words[len(words) // 2], words[0], words[-1], sum(words)))


if __name__ == '__main__':
    main()
