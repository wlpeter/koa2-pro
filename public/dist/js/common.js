$(document).ready(() => {
    setTimeout(() => {
        // 获取文章列表
        getItemList(initParam());
        // 获取未读消息
        notictReflush();
    }, 0);
    $(window).scroll(function(){
        if ($(this).scrollTop() > 150) {
            $('#backtotop').css("display", "block");
        } else {
            $('#backtotop').css("display", "none");
        }
    });
    $('#backtotop').click((event) => {
        $('html, body').animate({
            scrollTop: 0
        }, 500);
    });
    $('.test').click((event) => {
        alert("施工中。。。");
    });
});

/**
 * 获取未读消息
 */
function notictReflush() {
    if (document.getElementById('userInfo') && document.cookie) {
        let ssid = document.cookie.substring(document.cookie.indexOf('ssid=') + 5);
        ssid = ssid.indexOf(';') == -1 ? ssid : ssid.substring(0, ssid.indexOf(';'));
        let timeStamp = new Date().getTime();
        let iosocket = io.connect('/', { query:`timeStamp=${timeStamp}` });
        iosocket.on('connect', () => {
            iosocket.on(`${ssid}#${timeStamp}`, (data) => {
                $('span.badge').html(data);
            });
        });
        iosocket.on('disconnect', () => {
            console.log('disconnect');
        });
        iosocket.on('error', (err) => {
            console.error('Error: ' + err);
        });
    }
}


/**
 * 获取分类名
 */
function getClassify(code) {
    let result = null;
    switch(code) {
        case "team":
            result = "团队";
            break;
        case "personal":
            result = "个人";
            break;
        case "resource":
            result = "资源";
            break;
        case "faq":
            result = "官方告示";
            break;
        default:
            result = "";
            break;
    }
    return result;
}

/**
 * 获取文章类型名
 */
function getArticleType(code) {
    let result = null;
    switch(code) {
        case "ask":
            result = "问答";
            break;
        case "adveritise":
            result = "招聘";
            break;
        case "bulletin":
            result = "公告/活动";
            break;
        case "message":
            result = "留言板";
            break;
        case "life":
            result = "生活秀";
            break;
        default:
            result = "技术交流/作品展示";
            break;
    }
    return result;
}

/**
 * 获取文章类型样式
 */
function getIconClass(code) {
    let result = null;
    switch(code) {
        case "ask":
            result = "fa fa-lightbulb-o";
            break;
        case "adveritise":
            result = "fa fa-building-o";
            break;
        case "bulletin":
            result = "fa fa-bell";
            break;
        case "message":
            result = "fa fa-stethoscope";
            break;
        case "life":
            result = "fa fa-cutlery";
            break;
        default:
            result = "fa fa-file-text-o";
            break;
    }
    return result;
}

/***************************************************************** start
 * 文章列表元素
 */
var ItemTitle = React.createClass({
    getInitialState:function() {
        return {isPlus: true};
    },
    plusChange:function(event) {
        if (this.state.isPlus) {
            this.refs.plus.className = "fa fa-minus";
        } else {
            this.refs.plus.className = "fa fa-plus";
        }
        this.setState({isPlus: !this.state.isPlus});
    },
    render:function() {
        let detailData = this.props.detailData;
        let tarId = "#" + detailData.id;
        // 作者分类
        let classify = getClassify(detailData.classify);
        // 作者分类图标样式
        let tagIconClass = getIconClass(detailData.type);
        // 是否加精
        var starTag = detailData.isStar ? (<i className="fa fa-star text-gold" title="精华" />) : "";
        return (
            <div onClick={this.plusChange}  data-toggle="collapse" data-parent="#listGroup" data-target={tarId} className="pointer collapsed">
                <div className="media-left datem" title={classify}>
                    <i className={tagIconClass}></i>
                </div>
                <div className="media-body item-body">
                    <div className="media-heading">
                        <span className="title">{detailData.title}</span>{starTag}
                    </div>
                    <div className="media-body">
                        <div className="title-i" title="发布者"><i className="fa fa-edit"></i>&nbsp;{detailData.author} </div>
                        <span className="title-i" title="发布时间"><i className="fa fa-clock-o"></i>{detailData.updateAt} </span>
                    </div>
                </div>
                <div className="plus media-right">
                    <span className="plus-tag"><i className="fa fa-plus" ref="plus" ></i></span>
                </div>
            </div>
        );
    }
});

var ItemDetail = React.createClass({
    render: function() {
        let detailData = this.props.detailData;
        // 作者分类
        let classify = getClassify(detailData.classify);
        // 文章分类
        let articleType = getArticleType(detailData.type);
        return (
            <div id={detailData.id} className="collapse">
                <div className="accordion-inner">
                    <div className="media-left">
                        <a href="javascript:void(0);" className="test"><img src={detailData.iconLink} alt="" className="item-img" /></a>
                    </div>
                    <div className="media-body item-detail">
                        <table>
                            <tbody>
                                <tr><td>作者类型: </td><td>{classify}</td></tr>
                                <tr><td>作者: </td><td><a href="javascript:void(0);" className="test">{detailData.author}</a></td></tr>
                                <tr><td>文章类型: </td><td>{articleType}</td></tr>
                                <tr><td>总回复数: </td><td>{detailData.replyCount}</td></tr>
                                <tr><td>最近回复者: </td><td>{detailData.lastReply}</td></tr>
                                <tr><td>最近回复时间: </td><td>{detailData.lastReplyAt}</td></tr>
                            </tbody>
                        </table>
                        <a href={detailData.address} title="阅读文章">&nbsp;Read More&nbsp;<i className="fa fa-arrow-circle-left"></i></a>
                    </div>
                </div>
            </div>
        );
    }
});

var ItemList = React.createClass({
    render: function() {
        let groupList = this.props.list || [];
        if (!groupList || groupList.length == 0) {
            return <div>无文章发表...</div>;
        } else {
            return (
                <div className="list-group">{
                    groupList.map(function (child) {
                        return (
                            <div className="list-group-item list-item" key={child.id}>
                                <ItemTitle detailData={child} />
                                <ItemDetail detailData={child} />
                            </div>
                        );
                    })
                }</div>
            );
        }
    }
});
/**************************************** end ***********************************************/


/**
 * 初始化文章列表请求参数
 * @param  type 文章类型
 */
function initParam(type) {
    let param = {
        other:{}
    };
    let url = window.location.href;
    if (url.indexOf("classify/team") > -1) {
        param.classify = ["team"];
        param.type = type || ["ordinary", "bulletin", "life"];
    } else if (url.indexOf("classify/personal") > -1) {
       param.classify = ["personal"];
       param.type = type || ["ordinary", "ask", "adveritise", "life"];
   } else if (url.indexOf("classify/resource") > -1) {
       param.classify = ["resource"];
   } else if (url.indexOf("classify/faq") > -1) {
       param.classify = ["faq"];
       param.type = type || ["bulletin", "message"];
   } else if (url.indexOf("user/account") > -1) {
       param.classify = ["personal"];
       param.type = type || ["ordinary", "ask", "adveritise", "life"];
       param.other.page = 1;
       param.other.limit = 5;
       param.accountID = true;
   } else {
       param.other.page = 1;
       param.other.limit = 10;
       param.classify = ["team","personal","resource","faq"];
       param.type = type || ["ordinary", "bulletin"];
   }
   param.other.sort = {"updateAt":-1};
   return param
}

/**
 * 获取文章列表
 * @param   param 请求参数
 */
function getItemList(param) {
    if (document.getElementById('listGroup')) {
        param = param || {};
        $.ajax({
            url: "/article/list",
            type: "POST",
            dataType:'json',
            data: {
                condition: param
            },
            success: (list) => {
                ReactDOM.render(
                    <ItemList list={list.result} />,
                    document.getElementById('listGroup')
                );
            }
        });
    }
}
