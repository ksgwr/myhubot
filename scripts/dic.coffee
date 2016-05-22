# Description
#  辞書で覚えた対話を返答する
#
# Configuration:
#  HUBOT_DIC_DEVELOP=true(default)
#
# Commands:
#  hubot get - get dictionary by key
#  hubot put - put dictionary key -> value
#  hubot delete - delete dictionary by key
#  hubot value - search dictionary by value
#
# Notes:
#  すべての呼びかけに応答する
#
# Author:
#  ksgwr

Dic = require('../lib/dic')
dic = new Dic()
dic.load('public/dic/dic.tsv');

module.exports = (robot) ->
    HUBOT_DIC_DEVELOP = process.env.HUBOT_DIC_DEVELOP or true
    cmds = robot.helpCommands()

    if HUBOT_DIC_DEVELOP
        robot.respond /get (.+)/i, (msg) ->
            msg.send "#{msg.match[1]} is #{dic.entries[msg.match[1]]}"

        robot.respond /put (.+) (.+)/i, (msg) ->
            old = dic.entries[msg.match[1]]
            dic.put msg.match[1], msg.match[2]
            msg.send "save #{msg.match[1]} => #{msg.match[2]}(old:#{old})"

        robot.respond /delete (.+)/i, (msg) ->
            dic.delete msg.match[1]
            msg.send "delete #{msg.match[1]}"
    
        robot.respond /value (.+)/i, (msg) ->
            keys = dic.searchKeys msg.match[1]
            msg.send "#{msg.match[1]} in #{keys.join(',')}"

        robot.router.get '/entries', (req, res) ->
            res.type 'json'
            res.send dic.totsv()

    robot.respond /.*/, (msg) ->
        pos = if robot.name == '' then 0 else 1
        cmd = msg.match[0].split(' ')[pos]
        if cmds[cmd] != undefined
            return
        if dic.entries[cmd] != undefined
            msg.send dic.entries[cmd]



