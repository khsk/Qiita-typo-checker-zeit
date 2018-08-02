# Qiita-typo-checker-zeit
Qiita-typo-checkerをユーザー指定と任意テキストに限定したWebアプリとしてzeitにデプロイします

# 流用元

* [khsk/Qiita-typo-checker: Qiitaの投稿からtypoを検出します。](https://github.com/khsk/Qiita-typo-checker)
* [人間性をさがせよ QiitaのTypo検出 - Qiita](https://qiita.com/khsk/items/085db0947c650e2db463)

# 利用方法

https://qiita-typo-checker.now.sh/

にアクセスし、投稿をチェックしたいQiitaのユーザーIDまたはチェックしたいテキストを入力してください。

typoと判定された記述がある場合は、画面下部に該当した記事と正しい単語・見つけた誤字が表示されます。

(辞書型のtypo判定の場合はtypo文字列が出現数回表示されますが、textlint型の場合は出現数は表示されません)

# デプロイ

`now` CLIを使用します。

事前にQiitaのread可能なトークンをnowのseacretとして登録しておきます。

(トークンなしでも動作しますが、Qiita APIの利用制限が一時間に60回まで低下します)

`now secret add qiita-zeit-read-token (Qiitaで生成したtoken)`

`now --public -e token=@qiita-zeit-read-token && now alias && now rm qiita-typo-checker --safe --yes`

(Repositoryを落とした場合)

`now --public -e token=@qiita-zeit-read-token khsk/qiita-typo-checker-zeit && now alias && now rm qiita-typo-checker --safe --yes`

(GitHubから)

利用可能な場合は`now.json`に記述された`qiita-typo-checker.now.sh`にaliasが張られ、公開されます。

# 方針

誤判定するよりはtypoを逃さないようにwhitelistはゆるく作っています。

そのため、本当にtypoかは人の目に頼る部分が大きいです。

緩やかに頻出する誤判定などの例外的な記述は拡張していきますが、typoでも起きえそうな表現の場合は意図的に例外に含めない場合があります。

(あるいは例外的な記述が膨大になりそうなもの(createR*など))

一部、behaviorやlicenseなど、言語による表記ゆれ？をtypoにしていますが、積極的な修正を促すものではありません(知識不足のため)

正規表現の簡略化のため大文字・小文字の判定をしていません。

そのため、`Github`、`Javascript`など誤った記述の校正には対応していません。

# 参考

## ZEIT

* [ZEIT](https://zeit.co)
* [ZEIT – Deploying Git Repositories](https://zeit.co/blog/github)
* [ZEIT – Environment Variables and Secrets](https://zeit.co/blog/environment-variables-secrets)
* [Frequently Asked Questions - ZEIT Documentation](https://zeit.co/docs/other/faq)

## micro

* [zeit/micro: Asynchronous HTTP microservices](https://github.com/zeit/micro)
* [pedronauck/micro-router: A tiny and functional router for Zeit's Micro](https://github.com/pedronauck/micro-router)
* [Node.js でちょっとしたサーバーサイドやるなら、 Micro が良いかも - Qiita](https://qiita.com/acro5piano/items/d421e2d41ee15e20e1de)
* 

## pug

* [pugjs/pug: Pug – robust, elegant, feature rich template engine for Node.js](https://github.com/pugjs/pug)

## 

* [Documentation - Materialize](https://materializecss.com/)
