require('dotenv').config();
require('date-utils');
const { buffer } = require('micro');
const axios = require('axios');

const DICTIONARY = require('./dictionary');

const TextLintEngine = require('textlint').TextLintEngine;
const engine = new TextLintEngine();

const pug = require('pug');
const compiledFunction = pug.compileFile('template.pug');

if (process.env.token) {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + process.env.token;
}

// qiita apiから昨日から今日までの投稿を全て取得する
const getItems = async query => {
    const api_url   = 'https://qiita.com/api/v2/items';
    const per_page  = 100;
    let page        = 1;

    let items = [];
    while(page < 100) {
        let url = api_url + '?per_page=' + per_page + '&page=' + page + '&query=' + query;
        let res = await axios.get(url).catch(e => {
            // 一度kuromojiで出たのでキャッチしてダミーを返す
            console.log('catch e',e.toString());
            page = 0;
            return false;
        });

        if (!res || res.data.length == 0) {
            break;
        }

        items = items.concat(res.data);
        page++;
        // dev
        //break;
    }
    return items;
};

const checkItems = async items => {
    // forEach await待たない問題があるので、素直にするならfor of continue にする
    const hasTypos = [];
    for (const item of items) {
        // tagはバージョン情報などは不要なので、連結してしまう
        item.tags = Object.keys(item.tags).map(key => item.tags[key].name).join(', ');
        // 検索対象はタイトル、タグ、本文。一度に検索するためつなげてしまう(メモリだいぶ増)
        // Markdonwの```チェックのためつなげる改行を増やしている`
        let searchTarget = item.title + '\n\n' + item.body + '\n' + item.tags;
        // 量が多すぎるとtextlintが終わらないので、バイナリ、トークンなど長大データをそのまま貼り付けた行などを排除する それでもダメならlengthで足切りを検討
        searchTarget = searchTarget.replace(/.{200,}/g, '');
    
        item.typos = {};
        // 検索！
        Object.keys(DICTIONARY).forEach(correct => {
            let regexp = new RegExp('(' + DICTIONARY[correct].join('|') + ')', 'gim');
            let matches = searchTarget.match(regexp);
            if (!matches) {
                return;
            }
            item.typos[correct] = matches.join(', ');
        });
    
        const result = await engine.executeOnText(searchTarget).catch(e => { 
            console.log('textlint error', e);
            return [{messages : []}];
        });
        result[0].messages.forEach(message => {
            item.typos[message.message] = message.fix || message.ruleId;
        });
    
        if (Object.keys(item.typos).length == 0) {
            continue;
        }
        hasTypos.push(item)
    };
    return hasTypos;
}

const checkText = async text => {
    const item = {
        title: '入力テキスト',
        url: '',
        typos: {},
    }

    text = text.replace(/.{200,}/g, '');
    Object.keys(DICTIONARY).forEach(correct => {
        let regexp = new RegExp('(' + DICTIONARY[correct].join('|') + ')', 'gim');
        let matches = text.match(regexp);
        if (!matches) {
            return;
        }
        item.typos[correct] = matches.join(', ');
    });

    const result = await engine.executeOnText(text).catch(e => { 
        console.log('textlint error', e);
        return [{messages : []}];
    });
    result[0].messages.forEach(message => {
        item.typos[message.message] = message.fix || message.ruleId;
    });
    
    return Object.keys(item.typos).length == 0 ? [] : [item]
}


const main = async (req, res) => {
    let postParam = (await buffer(req)).toString()
    postParam = postParam.split('=')
    postParam = {[postParam[0]] : decodeURIComponent(postParam[1].replace(/\+/g, '%20'))}

    let checkedItems = []
    if ('userId' in postParam) {
        if (postParam.userId.indexOf('khsk') === -1) {
            const items = await getItems('user:' + postParam.userId.substr(0, 25).trim());
            checkedItems = await checkItems(items)
        }
    } else if ('text' in postParam) {
        checkedItems = await checkText(postParam.text.substr(0, 1000))
    }

    return compiledFunction({
        userId : postParam.userId,
        text   : postParam.text ? postParam.text.substr(0, 1000) : '',
        items  : checkedItems,
        isPost : true,
    })
}


module.exports = {main}