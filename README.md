# Heroku+Hubotを使い無料でLINE BOTを開発する
## はじめに

既に以下のQiitaなどで説明されているので何番煎じかは分かりませんが、
node.jsやherokuなどを普段使わない人にもなるべく分かりやすいように手とり足取りコマンドや開発の仕方をまとめるのが目的です。

* http://qiita.com/umakoz/items/6a0f36c9fc4eda1e839b
* http://qiita.com/yuya_takeyama/items/0660a59d13e2cd0b2516
* http://qiita.com/yoichiro6642/items/6d4c7309210af20a5c8f

## Macでnode.jsのセットアップ

node.jsをMacでインストールする場合はnodebrewを使うと良いでしょう。

```
$ curl https://raw.githubusercontent.com/hokaccha/nodebrew/master/nodebrew | perl - setup
$ nodebrew install latest
$ nodebrew use latest
$ node -v
v6.0.0
$ which node
/Users/****/.nodebrew/current/bin/node
```

## hubotのインストール

```
$ npm install -g yo generator-hubot
(-gをつけるとグローバルにインストールされ、環境パスなどに通る)
$ mkdir myhubot
$ cd myhubot
$ yo hubot --defaults
(hubotのテンプレートを作成する)
```

## LINE-Hubot Adapterをインストール

```
$ npm install hubot-line --save
(--saveを付けるとpackage.jsonに自動で依存が追加される)
$ cat Procfile
web: bin/hubot -a line -n ""
(Herokuで実行されるコマンド。LINE BOTでは名前を省略できるように空文字を明示的に設定すると良い。指定しなければHubotになる)
```

## Herokuセットアップ

```
$ git init
$ git add -A
$ git commit -m "init"
$ heroku create
$ git push heroku master
(更新時はcommitして上記のpushを繰り返す)
$ heroku addon:create fixie:tricycle
(書き込み時のIPを固定するためのProxyのAddonを追加。
1ヶ月500リクエストまでは無料)
$ heroku ps:scale web=1
(リクエストが増えても課金されないように1プロセスで回す)

以下 https://github.com/umakoz/hubot-line を参考にする
$ heroku config:add HUBOT_LINE_CHANNEL_ID="your_channel_id"
$ heroku config:add HUBOT_LINE_CHANNEL_SECRET="your_channel_secret"
$ heroku config:add HUBOT_LINE_CHANNEL_SECRET="your_channel_secret"
$ heroku config:add HUBOT_LINE_PROXY_URL="http://fixie:******@*****.usefixie.com:80"
(Fixieのプラグインページを開き確認する)
$ heroku config:add HUBOT_LOG_LEVEL="debug"
(debug用)
$ git push heroku master
$ heroku logs
以下、エラーが出ていなかなどを確認する
```

## Hubot開発

https://github.com/ksgwr/myhubot に上げたプログラムを例に説明します。
Hubot自体もテストケースなどは書けるようですが、色々と使いにくいようなので、基本的にライブラリを別途作成し、ライブラリ単体で動作確認しながら開発します。
HubotではCoffeeScriptがよく使われますが、CoffeeScriptはCoffeeScriptの実行環境が入ってないと使えず、ライブラリとしての再利用性が低いのでjsファイルで開発することにします。

```
$ mkdir lib test
$ npm install -g mocha
(Node.jsのテスト実行のためにmochaを入れる)
$ cat lib/myclass.js
var MyClass = function() {
    this.member = 'member variable';
};
MyClass.prototype.myfunc = function() {
};
module.exports = MyClass;
$ cat test/myclass_test.js
var assert = require('assert');
var MyClass = require('../lib/myclass');
describe('MyClass test', function() {
    it('myfunc test', function(done) {
        var myclass = MyClass();
        myclass.myfunc();
        assert.equal(2, 1+1);
        done(); //callbackなどを利用した時に明示的に呼び出す
    });
});
$ mocha
  MyClass test
    ✓ myfunc test
  
  1 passing (Xms)
```

libraryで動作確認が取れたら、Hubotに組み込みHubot shellでテストします。Hubotではカスタムスクリプトはscriptsフォルダに配置します。

```
$ cat scripts/myapp.coffee
MyClass = require('../lib/myclass')
module.exports = (robot) ->
    robot.respond /hello/i, (msg) ->
        # robot.sendだとLINE BOTでは宛先がわからずエラーになる
        msg.send "hello world"
        
$ ./bin/hubot
(shell scriptで立ち上がる)
Hubot> Hubot hello
Hubot> hello world
```

実行確認ができればheroku push heroku masterし、実際にLINEで動作確認して終了です。今回はLINEやHeroku上の設定の仕方などはまとめていませんが、LINEに設定するIP Whitelistの反映には私の場合には半日程度かかりましたので注意しましょう。その場合、Hubotからの書き込みができず既読スルーされます。ただし、その場合でもheroku logsコマンドでアクセスが来ていることは確認できるはずです。
