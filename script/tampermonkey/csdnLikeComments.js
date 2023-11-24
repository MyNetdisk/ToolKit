// ==UserScript==
// @name          csdn 手动一键点赞评论
// @namespace     https://blog.csdn.net/weixin_44663365
// @version       0.0.1
// @description   打开博文，点击一键点赞评论按钮后自动为该博文点赞以及评论，前提是已经登录 csdn 博客
// @author        weixin_44663365
// @include       *://blog.csdn.net/*/article/details/*
// @include       *.blog.csdn.net/article/details/*
// ==/UserScript==

(function() {
    'use strict';
    let button = document.createElement('button')//创建一个按钮
    button.textContent = '一键点赞评论'//按钮内容
    button.style.width = '90px'//按钮宽度
    button.style.height = '28px'//按钮高度
    button.style.align = 'center'//按钮文字居中
    button.style.color = '#fff'//按钮文字颜色
    button.style.background = '#e33e33'//按钮背景色
    button.style.border = '1px solid #e33e33'//按钮边框
    button.style.borderRadius = '4px'//按钮圆角
    button.addEventListener('click',clickButton)//监听按钮点击事件
    /**
     * 按钮点击事件
     */
    function clickButton(){
        setTimeout(()=>{
            let comment = ["针不戳呀，写的针不戳！","学习了！b（￣▽￣）d","本文不错(￣ˇ￣)，值得学习！(=￣ω￣=)","感谢博主的分享！(^ ^)／▽▽＼(^ ^)","感谢博主，你的文章让我得到一些收获！(￣ˇ￣)"]
            let STARTNUMBER = -1;
            let ENDNUMBER = 5;
            let temp_count = Math.floor(Math.random()*(STARTNUMBER-ENDNUMBER+1))+ENDNUMBER ;//取STARTNUMBER-ENDNUMBER之间的随机数 [STARTNUMBER,ENDNUMBER]
            document.getElementsByClassName("tool-item-comment")[0].click(); //打开评论区
            document.getElementById("comment_content").value = comment[temp_count]; //随机把一条预先写好的评论赋值到评论框里面
            document.getElementsByClassName("btn-comment")[0].click(); //发表评论
            document.getElementById("is-like").click() //点赞。把该代码注释后只会一键评论
        },100)
    }
    let toolboxList = document.getElementsByClassName('toolbox-list')[0]//底部点赞评论列表元素
    toolboxList.appendChild(button)//将按钮添加到底部点赞评论列表元素
})();