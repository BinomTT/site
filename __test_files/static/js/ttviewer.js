"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
var edurequest_1 = require("../asc/edurequest");
var asc_react_1 = require("../asc/asc_react");
var dbi_1 = require("../rpr/dbi");
var React = require("react");
var currenttt_1 = require("./currenttt");
var actions_1 = require("../asc/actions");
var regulartt_1 = require("./regulartt");
var lib_date_1 = require("../asc/lib_date");
var react_dom_1 = require("react-dom");
var asc_react2_1 = require("../asc/asc_react2");
var ttviewer_1 = require("./server/ttviewer");
var datatable_1 = require("../react/datatable");
var dbi_react_1 = require("../rpr/dbi_react");
var event_popup_1 = require("../calendar/event_popup");
var RDpRow = React.lazy(function () { return Promise.resolve().then(function () { return require('../dashboard/dprow'); }); });
function TTViewer(props) {
    var _this = this;
    var _a, _b;
    var req = edurequest_1.client_req;
    var fitheight = props.fitheight, kiosk = props.kiosk;
    asc_react_1.useTTLang();
    var _c = React.useState(asc_react_1.useResponsiveLevel()), compactLevel = _c[0], setCompactLevel = _c[1];
    var onOverflow = function () { return setCompactLevel(Math.min(2, compactLevel + 1)); };
    var _d = asc_react_1.useClientWidth(), width = _d[0], div_ref = _d[1];
    var prev_width = asc_react_1.usePrevious(width, 0);
    React.useEffect(function () {
        if (width > prev_width && prev_width > 0)
            setCompactLevel(0);
    }, [width]);
    var tables = [
        'classes',
        'teachers',
        'students',
        'classrooms',
        'igroups',
        'subjects',
    ];
    var my_user = req.loggedUser;
    if (my_user == 'Admin' || tables.indexOf(dbi_1.DBITools.user2rowid(my_user).table) < 0)
        my_user = '';
    if (!my_user) {
        var studentid = req.isStudentOrParent();
        if (studentid)
            my_user = 'Student' + studentid;
    }
    var _e = React.useState(props.user || my_user), user = _e[0], setUser = _e[1];
    var userRow = dbi_1.DBITools.user2rowid(user);
    var oblast = (userRow.id == '*' ? userRow.table + '_summary' : userRow.table);
    var today = req.timezone_date();
    var _f = React.useState(props.date || (props.week && lib_date_1.week_start(req, props.week)) || today), date = _f[0], setDate = _f[1];
    var _g = React.useState(props.num ? 'regular' : 'current'), mode = _g[0], setMode = _g[1];
    var setShowCurrent = function () {
        setMode('current');
    };
    var _h = React.useState('svg'), regularMode = _h[0], setRegularMode = _h[1];
    var _j = React.useState(true), fixTTColors = _j[0], setFixTTColors = _j[1];
    var _k = React.useState(props.num || ''), tt_num = _k[0], set_tt_num = _k[1];
    var setShowRegular = function (num) {
        setSelectedTTItem(null);
        setMode('regular');
        set_tt_num(num);
    };
    var _l = React.useState(null), selectedTTItem = _l[0], setSelectedTTItem = _l[1];
    React.useEffect(function () {
        setSelectedTTItem(null);
    }, [date, user]);
    var _m = React.useState(), subtoolbar = _m[0], setSubtoolbar = _m[1];
    var _o = React.useState(null), dbi = _o[0], setDbi = _o[1];
    var _p = React.useState({}), rights = _p[0], setRights = _p[1];
    var week = lib_date_1.date_week(req, date);
    var this_week = lib_date_1.date_week(req, today);
    var min_week = lib_date_1.week_delta(req, this_week, -2);
    if (req.isAdmin() || (req.isUcitel() && !req.hasRight('limited')))
        min_week = '';
    var datefrom = lib_date_1.week_start(req, week);
    var dateto = lib_date_1.week_end(req, week);
    var year = req.getSchoolYear(date);
    var datefrom_inyear = dbi_1.strMax(datefrom, req.schoolYear_turnOver(year));
    var dateto_inyear = dbi_1.strMin(dateto, req.schoolYear_turnOver_end(year));
    var data = asc_react_1.useAsyncMemo(function () { return ttviewer_1.getTTViewerData(null, year); }, [year], null, { interactive: false });
    var _q = asc_react_1.useLocalState('CurrentTTViewer.showColor', data ? data.defaults.showColors : true), showColors = _q[0], setShowColors = _q[1];
    var _r = React.useState(true), showOrig = _r[0], setShowOrig = _r[1];
    var _s = React.useState(false), showIgroupsInClasses = _s[0], setShowIgroupsInClasses = _s[1];
    var _t = useStateWithDefault((_a = data === null || data === void 0 ? void 0 : data.defaults.timeMode) !== null && _a !== void 0 ? _a : false), timeMode = _t[0], setTimeMode = _t[1];
    var _u = useStateWithDefault((_b = data === null || data === void 0 ? void 0 : data.defaults.swapAxis) !== null && _b !== void 0 ? _b : false), swapAxis = _u[0], setSwapAxis = _u[1];
    var _v = React.useState(false), fit = _v[0], setFit = _v[1];
    var _w = React.useState(true), colorsEnabledInRegular = _w[0], setColorsEnabledInRegular = _w[1];
    var _x = React.useState(false), disableColorsInRegular = _x[0], setDisableColorsInRegular = _x[1];
    React.useEffect(function () {
        if (fitheight)
            barWndResize();
    }, [data]);
    var print_ref = React.useRef();
    React.useEffect(function () {
        if (!data)
            return;
        if (mode == 'regular' && oblast == 'igroups_summary') {
            setUser('');
            return;
        }
        if (mode == 'current') {
            if (!data.current.allow)
                setShowRegular(data.regular.default_num);
            if (oblast == 'classes_summary' || oblast == 'teachers_summary' || oblast == 'classrooms_summary') {
                setUser('');
            }
        }
        if (dbi && !oblast.endsWith('_summary')) {
            var _a = dbi_1.DBITools.user2rowid(user), table = _a.table, id = _a.id;
            if (!dbi.rowData(table, id)) {
                if (rights.classes) {
                    var classid = dbi.tableIds('classes')[0];
                    if (classid)
                        setUser("Trieda" + classid);
                }
            }
        }
    }, [mode, oblast, data, dbi, user]);
    if (!data)
        return React.createElement(asc_react_1.Loading, null);
    var user_Kruzok_ALL = 'Kruzok*';
    var settings_menu = [
        {
            text: req.ls(1637),
            onClick: showSettings
        },
        [],
        {
            text: req.ls(1190),
            onClick: showRights
        },
    ];
    if (req.hasRight('timetable')) {
        settings_menu.push([]);
        settings_menu.push({
            text: req.ls(10190),
            onClick: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, Promise.resolve().then(function () { return require('../customize/privacy'); })];
                    case 1:
                        (_a.sent()).showPrivacyPublicDlg();
                        return [2];
                }
            }); }); }
        });
    }
    var menu = [];
    if (mode == 'current' && dbi) {
        if (menu.length > 0)
            menu.push([]);
        menu.push({
            text: req.ttls(1009),
            checked: showColors,
            onClick: function () { return setShowColors(!showColors); }
        });
        menu.push({
            text: req.ls(1489) + ': ' + req.ls(2322),
            checked: showOrig,
            onClick: function () { return setShowOrig(!showOrig); }
        });
        if (userRow.table == 'classes' && dbi.tableData('igroups').length > 0) {
            menu.push({
                text: req.ls(1489) + ': ' + dbi.table('igroups').name(),
                checked: showIgroupsInClasses,
                onClick: function () { return setShowIgroupsInClasses(!showIgroupsInClasses); }
            });
        }
        menu.push({
            text: req.ttls(2858),
            checked: swapAxis,
            onClick: function () { return setSwapAxis(!swapAxis); }
        });
        menu.push({
            text: req.ttls(1010),
            checked: fit,
            onClick: function () { return setFit(!fit); }
        });
        if (menu.length)
            menu.push([]);
        menu.push({
            text: req.ls(6399),
            checked: !timeMode,
            onClick: function () { return setTimeMode(false); }
        });
        menu.push({
            text: req.ls(1345),
            checked: timeMode,
            onClick: function () { return setTimeMode(true); }
        });
    }
    if (mode == 'regular') {
        if (colorsEnabledInRegular) {
            if (menu.length > 0)
                menu.push([]);
            menu.push({
                text: req.ttls(1009),
                checked: !disableColorsInRegular,
                onClick: function () { return setDisableColorsInRegular(!disableColorsInRegular); }
            });
        }
    }
    if (req.props.isAsc) {
        menu.push([]);
        if (mode == 'regular')
            menu.push({
                text: 'HTML (aSc)',
                checked: regularMode == 'html',
                onClick: function () { return setRegularMode(regularMode == 'html' ? 'svg' : 'html'); }
            });
        menu.push({
            text: 'Fix TT Colors (aSc)',
            checked: fixTTColors,
            onClick: function () { return setFixTTColors(!fixTTColors); }
        });
    }
    if (user) {
        if (menu.length)
            menu.push([]);
        menu.push({
            text: actions_1.action_name('print'),
            onClick: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var PrintSheet, name;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (print_ref.current) {
                                print_ref.current();
                                return [2];
                            }
                            return [4, Promise.resolve().then(function () { return require('../dashboard/printSheet'); })];
                        case 1:
                            PrintSheet = (_a.sent()).PrintSheet;
                            name = req.ls(1001) + ' - ' + dbi.rowName(userRow.table, userRow.id);
                            if (mode == 'regular')
                                name = req.ls(8735);
                            asc_react_1.RDialog.show(React.createElement(PrintSheet, { renderer: function () { return null; }, asDialog: true, filename: name }, contentProvider(true)));
                            return [2];
                    }
                });
            }); }
        });
    }
    if (data && data.regular.default_num && data.current.allow) {
        menu.push([]);
        menu.push({
            text: req.ls(8735),
            onClick: function () {
                if (mode == 'regular') {
                    setShowCurrent();
                }
                else {
                    setShowRegular(data.regular.default_num);
                }
            },
            checked: mode == 'regular'
        });
    }
    {
        menu.push([]);
        menu.push({
            text: ASC.ls(1248),
            onClick: function () {
                var url = "https://" + ASC.edupage + ".edupage.org/timetable/view.php";
                var params = [];
                if (mode == 'regular') {
                    if (tt_num) {
                        params.push("num=" + tt_num);
                    }
                }
                else {
                    if (week != this_week) {
                        params.push('week=' + week);
                    }
                }
                if (userRow.table) {
                    if (userRow.id == '*') {
                        params.push('summary=' + userRow.table);
                    }
                    else {
                        params.push(dbi_1.DBITools.removeEs(userRow.table) + '=' + userRow.id);
                    }
                }
                prompt(ASC.ls(1248) + ":", url + '?' + params.join('&'));
            }
        });
    }
    if (req.hasRight('timetable')) {
        var submenu = tslib_1.__spreadArrays(settings_menu);
        submenu.push([]);
        submenu.push({
            text: req.ls(1687),
            onClick: openTTOnline
        });
        if (menu.length > 0)
            menu.push([]);
        menu.push({
            text: req.ls(2340),
            submenu: submenu
        });
    }
    if ((req.isAdmin() || req.isUcitel())) {
        var help_1 = '';
        if (req.lang == 'de') {
            help_1 = 'https://help.edupage.org/text.php?id=3161&lang=de';
        }
        if (req.lang == 'sk' || req.lang == 'cz') {
            help_1 = 'https://help.edupage.org/text.php?id=3161&lang=sk';
        }
        if (help_1) {
            menu.push([]);
            menu.push({
                text: actions_1.action_name('help'),
                onClick: function () { return window.open(help_1, '_blank'); }
            });
        }
    }
    if (data.asklogin) {
        var msg = req.ls(4788);
        if (!req.loggedUser) {
            msg = React.createElement(React.Fragment, null,
                req.ls(2853),
                React.createElement(asc_react_1.VGap, { height: 20 }),
                React.createElement(asc_react_1.RButton, { label: req.ls(1012), onClick: function () { return document.location.href = '/login/'; }, type: 'green' }));
        }
        return React.createElement(React.Fragment, null, msg);
    }
    var summary_menu = [];
    if (mode == 'regular' && dbi) {
        var _loop_1 = function (t) {
            if (!rights[t + '_summary'])
                return "continue";
            summary_menu.push({
                text: dbi.table(t).name(),
                checked: userRow.table == t && userRow.id == '*',
                onClick: function () { return setUser(dbi_1.DBITools.rowid2user(t, '*')); }
            });
        };
        for (var _i = 0, _y = ['classes', 'teachers', 'classrooms']; _i < _y.length; _i++) {
            var t = _y[_i];
            _loop_1(t);
        }
    }
    var right_style = {};
    var setViewData = function (data) {
        var dbi = data.dbi, rights = data.rights, colorsEnabled = data.colorsEnabled;
        if (dbi)
            setDbi(dbi);
        if (rights)
            setRights(rights);
        if (mode == 'regular' && colorsEnabled != undefined)
            setColorsEnabledInRegular(colorsEnabled);
        print_ref.current = data.print;
    };
    var message = undefined;
    if (!user) {
        message = React.createElement(React.Fragment, null,
            React.createElement("i", { className: "fa fa-reply fa-rotate-90" }),
            React.createElement(asc_react_1.HGap, { width: 20 }),
            (rights.classes || data.allow_my_items.classes) &&
                React.createElement(React.Fragment, null,
                    req.ls(6801),
                    "..."));
    }
    if (mode == 'regular' && !tt_num && data.regular.timetables.filter(function (t) { return !t.hidden; }).length == 0) {
        message = React.createElement(React.Fragment, null,
            data.regular.timetables.filter(function (t) { return t.year == year; }).length > 0
                ? req.ls(1759)
                : req.ls(1644) + ' (' + req.getSchoolYearName(year) + ')',
            req.hasRight('timetable') && React.createElement(React.Fragment, null,
                React.createElement(asc_react_1.VGap, { height: 30 }),
                React.createElement(asc_react_1.RButton, { label: req.ls(1687), onClick: openTTOnline, type: 'green' })));
    }
    var week_menu = [];
    if (week != this_week) {
        week_menu.push({
            text: req.ls(1733),
            onClick: function () { return setDate(lib_date_1.week_start(req, this_week)); }
        });
    }
    if (data.regular.default_num && !kiosk) {
        if (week_menu.length > 0)
            week_menu.push([]);
        week_menu.push({
            text: req.ls(8735),
            onClick: function () { return setShowRegular(data.regular.default_num); }
        });
    }
    var contentProvider = function (print) {
        if (print === void 0) { print = false; }
        var onTTItemClick = print ? undefined : setSelectedTTItem;
        if (mode == 'regular') {
            return React.createElement(regulartt_1.RegularTTView, { tt_num: tt_num, oblast: oblast, id: userRow.id, disableColors: disableColorsInRegular, mode: regularMode, fixTTColors: fixTTColors, style: {
                    flex: '1 1 0px',
                    minWidth: 100
                }, fit: true, buildButtonsPortal: print
                    ? undefined
                    : function (menu) {
                        if (!subtoolbar)
                            return undefined;
                        return react_dom_1.createPortal(menu.map(function (item, i) {
                            if (Array.isArray(item))
                                return React.createElement(asc_react_1.HGap, { key: i, width: 5 });
                            return React.createElement(TopButton, { key: i, text: item.text, icon: item.icon, onClick: item.onclick });
                        }), subtoolbar);
                    }, setViewData: print ? undefined : setViewData, onTTItemClick: onTTItemClick, selectedTTItem: print ? undefined : selectedTTItem });
        }
        else {
            return React.createElement(currenttt_1.CurrentTTView, { table: userRow.table, id: userRow.id, year: year, datefrom: datefrom, dateto: dateto, showColors: showColors, showIgroupsInClasses: showIgroupsInClasses, showOrig: showOrig, showCurrentTime: !print, showHeader: true, time_mode: timeMode, swapAxis: swapAxis, fit: fit && !print, onTTItemClick: onTTItemClick, selectedTTItem: print ? undefined : selectedTTItem, setViewData: print ? undefined : setViewData, fixTTColors: fixTTColors, style: print
                    ? undefined
                    : {
                        flex: '1 1 0px',
                        minWidth: 100
                    }, print: print });
        }
    };
    var regular_tt = data && data.regular.timetables.find(function (tt) { return tt.tt_num == tt_num; });
    return React.createElement("div", { ref: div_ref, id: fitheight ? 'fitheight' : undefined, style: tslib_1.__assign({ display: 'flex', flexDirection: 'column', boxSizing: 'border-box', minHeight: 100, height: compactLevel == 0 ? '80vh' : (fitheight ? 300 : 650), background: '#ffffff' }, props.style || {}) },
        React.createElement("div", { style: {
                display: 'flex',
                flexDirection: 'row',
                marginBottom: 10,
                whiteSpace: 'pre',
                overflowX: 'auto',
                overflowY: 'hidden'
            } },
            data.allow_my_user && React.createElement(TopButton, { text: req.ls(3883), selected: user != '' && user == data.allow_my_user, style: { marginRight: 15 }, onClick: function () { return setUser(data.allow_my_user); }, onOverflow: onOverflow }),
            dbi && tables.map(function (t) {
                if (!rights[t] && !data.allow_my_items[t])
                    return null;
                if (mode == 'regular' && t == 'igroups')
                    return null;
                var rows = dbi.tableData(t).map(function (row) { return dbi_1.DBITools.rowApplyChanges(row, dateto); });
                if (t == 'teachers')
                    rows = rows.filter(function (trow) { return !trow.expired; });
                if (!rights[t]) {
                    if (!data.allow_my_items[t])
                        return null;
                    rows = rows.filter(function (row) { return data.allow_my_items[t].includes(row.id); });
                }
                var item2menuItem = function (id, suffix) {
                    var row = dbi.rowData(t, id);
                    return {
                        text: ASC.escapeHTML(dbi.rowName(t, row.id, req.sort_name_col) + (suffix || '')),
                        onClick: function () { return setUser(dbi_1.DBITools.rowid2user(t, row.id)); },
                        className: row['cb_hidden'] ? 'item-old' : '',
                        checked: t == userRow.table && row.id == userRow.id
                    };
                };
                var menu = [];
                if (t == 'students') {
                    var locale_1 = ASC.lang_getLocale();
                    var srows = tslib_1.__spreadArrays(rows);
                    srows.sort(function (a, b) { return dbi.rowName(t, a.id, req.sort_name_col).localeCompare(dbi.rowName(t, b.id, req.sort_name_col), locale_1); });
                    var _loop_2 = function (classid) {
                        var checked = false;
                        var submenu_1 = srows
                            .filter(function (srow) { return srow.classid == classid; })
                            .map(function (srow) {
                            var item = item2menuItem(srow.id);
                            checked = checked || item.checked;
                            return item;
                        });
                        if (submenu_1.length == 0)
                            return "continue";
                        menu.push({
                            text: dbi.rowName('classes', classid),
                            submenu: submenu_1,
                            checked: checked
                        });
                    };
                    for (var _i = 0, _a = dbi.tableIds('classes'); _i < _a.length; _i++) {
                        var classid = _a[_i];
                        _loop_2(classid);
                    }
                    var submenu = srows
                        .map(function (srow) { return item2menuItem(srow.id, srow.classid && (' (' + dbi.rowName('classes', srow.classid) + ')')); });
                    menu.push([]);
                    menu.push({
                        text: req.ls(2824),
                        submenu: submenu
                    });
                }
                else {
                    menu = dbi_1.DBITools.splitItemsForCombo(rows).map(function (row) { return item2menuItem(row.id); });
                    if (t == 'igroups' && dbi.tableData(t).length > 1 && rights.igroups_summary) {
                        menu.push([]);
                        menu.push({
                            text: req.ls(1349),
                            checked: user == user_Kruzok_ALL,
                            onClick: function () { return setUser(user_Kruzok_ALL); }
                        });
                    }
                }
                if (rows.length == 0)
                    return null;
                var selected = oblast == t && user != my_user;
                if (t == 'igroups' && oblast == 'igroups_summary')
                    selected = true;
                var icon = undefined;
                var title = dbi.table(t).name();
                if (compactLevel >= 2) {
                    title = undefined;
                    icon = dbi.table(t).icon();
                }
                return React.createElement(TopButton, { key: t, text: title, icon: icon, selected: selected, menu: menu, onOverflow: onOverflow });
            }),
            summary_menu.length > 0 && React.createElement(TopButton, { text: compactLevel == 0 ? req.ls(1250) : undefined, icon: compactLevel == 0 ? undefined : '/timetable/pics/app/office/schedule_32.png', title: req.ls(1250), menu: summary_menu, selected: userRow.id == '*' }),
            React.createElement("span", { ref: function (s) { return setSubtoolbar(s); }, style: {
                    marginLeft: 10,
                    display: 'flex',
                    flexDirection: 'row',
                    minWidth: 0,
                    flexShrink: 1
                } }),
            req.hasRight('timetable') && compactLevel == 0 && React.createElement(React.Fragment, null,
                React.createElement(asc_react_1.HGap, { width: 5 }),
                React.createElement(TopButton, { text: actions_1.action_name('customize'), icon: '/global/pics/ui/tools.svg', menu: tslib_1.__spreadArrays(settings_menu) }),
                React.createElement(TopButton, { text: req.ls(2340), icon: '/global/pics/ui/timetables_48.svg', onClick: openTTOnline })),
            React.createElement("span", { style: { flex: 1 } }),
            mode == 'regular'
                ? React.createElement(React.Fragment, null,
                    React.createElement(TopButton, { text: regular_tt && regular_tt.hidden ? regular_tt.text : req.ls(8735), style: right_style, menu: kiosk
                            ? undefined
                            : tslib_1.__spreadArrays(data.regular.timetables.filter(function (tt) { return !tt.hidden; }).map(function (tt) {
                                return {
                                    text: tt.text,
                                    checked: tt.tt_num == tt_num,
                                    onClick: function () { return setShowRegular(tt.tt_num); }
                                };
                            }), req.isAdmin()
                                || req.hasRight('timetable')
                                || req.hasRight('ttadminview')
                                || (req.isUcitel() && !req.hasRight('limited'))
                                ? [
                                    {
                                        text: req.ls(8044) + '...',
                                        onClick: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                            var num;
                                            return tslib_1.__generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4, asc_react_1.RDialog.show(React.createElement(ChooseRegularTTDlg, null))];
                                                    case 1:
                                                        num = _a.sent();
                                                        if (num)
                                                            setShowRegular(num);
                                                        return [2];
                                                }
                                            });
                                        }); }
                                    }
                                ]
                                : [], data.current.allow
                                ? [
                                    [],
                                    {
                                        text: req.ls(6204),
                                        onClick: function () { return setShowCurrent(); }
                                    }
                                ]
                                : []), enabled: true }))
                : React.createElement(React.Fragment, null,
                    week > min_week && React.createElement(TopButton, { text: compactLevel == 0 ? '<<' : '<', style: right_style, onClick: function () { return setDate(lib_date_1.date_delta(datefrom_inyear, -1)); } }),
                    React.createElement(TopButton, { text: week == this_week ? req.ls(1733) : lib_date_1.date_format_2dates(req, datefrom_inyear, dateto_inyear, compactLevel == 0), style: right_style, menu: week_menu, enabled: true }),
                    React.createElement(TopButton, { text: compactLevel == 0 ? '>>' : '>', style: right_style, onClick: function () { return setDate(lib_date_1.date_delta(dateto_inyear, +1)); } })),
            !kiosk && React.createElement(TopButton, { text: React.createElement("i", { className: 'fa fa-caret-down' }), style: tslib_1.__assign(tslib_1.__assign({}, right_style), { color: '#808080' }), menu: menu })),
        message && React.createElement(React.Fragment, null,
            React.createElement("div", { style: {
                    minHeight: 0,
                    flex: '1 1 0px',
                    padding: 15,
                    fontSize: 16,
                    color: '#a0a0a0',
                    boxSizing: 'border-box',
                    display: user ? 'none' : undefined
                } }, message)),
        React.createElement("div", { style: {
                display: message ? 'none' : 'flex',
                flexDirection: 'row',
                minHeight: 0,
                flex: '1 1 0px'
            } },
            React.createElement("div", { style: {
                    display: 'flex',
                    flex: '1 1 0px',
                    overflow: 'auto',
                    position: 'relative'
                } }, contentProvider()),
            selectedTTItem && React.createElement(React.Fragment, null,
                React.createElement(asc_react2_1.VSeparatorLine, { height: 'auto' }),
                React.createElement(TTItemDetails, { ttitem: selectedTTItem, dbi: dbi, style: {
                        width: 250,
                        marginRight: 10
                    }, onClose: function () { return setSelectedTTItem(null); } }))));
}
exports.TTViewer = TTViewer;
TTViewer.needed_part = dbi_1.typed({
    teachers: ['__name', 'cb_hidden', 'expired'],
    classes: ['__name'],
    classrooms: ['__name'],
    igroups: ['__name'],
    students: ['__name', 'classid'],
    subjects: ['__name']
});
function TopButton(props) {
    var _a = asc_react_1.useHoverWithMenu(), isHovering = _a[0], hoverProps = _a[1], showMenu = _a[2];
    var ref = React.createRef();
    var text = props.text, icon = props.icon, title = props.title, selected = props.selected, onOverflow = props.onOverflow;
    var clickable = !!(props.onClick || props.menu);
    var enabled = props.enabled;
    if (enabled == undefined)
        enabled = clickable;
    asc_react_1.useDomReader(function () {
        var span = ref.current;
        if (!span)
            return;
        if (span.scrollWidth > span.offsetWidth && onOverflow)
            onOverflow();
    });
    return React.createElement("span", tslib_1.__assign({ ref: ref }, hoverProps, { title: title || (typeof text == 'string' ? text : ''), style: tslib_1.__assign({ background: enabled
                ? ((isHovering || selected) ? '#E3F2FD' : undefined)
                : undefined, padding: '10px 15px', borderTop: '2px solid ' + (selected ? '#2196F3' : 'rgba(0,0,0,0)'), cursor: clickable ? 'pointer' : undefined, textTransform: 'uppercase', fontSize: 12, fontWeight: selected ? 'bold' : undefined, color: enabled ? '#333' : '#ccc', flexShrink: 1, minWidth: 10, overflow: 'hidden', textOverflow: text ? 'ellipsis' : undefined }, props.style || {}), onClick: function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (props.onClick) {
                props.onClick(e);
            }
            else if (props.menu) {
                showMenu(props.menu, e.currentTarget);
            }
        }, onMouseDown: function (e) { return e.preventDefault(); } }),
        icon && React.createElement("img", { src: icon, style: {
                maxHeight: 16,
                filter: enabled ? undefined : 'grayscale(100%) opacity(50%)',
                marginRight: text ? 5 : undefined,
                verticalAlign: 'middle'
            } }),
        text);
}
exports.TopButton = TopButton;
function TTItemDetails(props) {
    var ttitem = props.ttitem, dbi = props.dbi, onClose = props.onClose;
    var inDlg = props.inDlg || false;
    var req = edurequest_1.client_req;
    var colors = asc_react_1.useColors();
    var type = ttitem.type, date = ttitem.date, eventids = ttitem.eventids, dpRow = ttitem.dpRow;
    var title = req.ls(1301);
    var icon = "/global/pics/ui/subject_32.svg";
    switch (type) {
        case 'event':
            title = req.ls(1831);
            icon = '/global/pics/ui/events_32.svg';
            break;
        case 'classroomsupervision':
            title = req.ls(1723);
            break;
        case 'absent':
            title = req.ls(1846);
            icon = '/global/pics/ui/subst_32.svg';
            break;
        case 'subst_duty':
            title = req.localize('{tt:1471} ({1003})');
            icon = '/substitution/pics/must_be_32.svg';
            break;
        case 'other':
            title = '';
            icon = '';
            break;
    }
    var Field = React.useCallback(function (props) { return React.createElement("div", { style: tslib_1.__assign({ fontSize: 16, marginBottom: 5 }, props.style || {}) }, props.children); }, []);
    var itemNames = function (table, ids) {
        return dbi.tools.itemName(table) + ': ' + dbi.rowNames(table, ids);
    };
    var itemName = function (table, id) {
        return itemNames(table, id ? [id] : []);
    };
    var popis = dbi.tools.ttitem_popis(ttitem);
    return React.createElement("div", { style: tslib_1.__assign({ position: 'relative', background: colors.bgWhite }, props.style || {}) },
        React.createElement(asc_react2_1.DlgHeader, { title: title, inDlg: inDlg, icon: icon, small: true }),
        onClose && React.createElement("i", { className: 'fa fa-times', style: {
                position: 'absolute',
                right: 0,
                top: 0,
                cursor: 'pointer',
                fontSize: 16,
                color: colors.faintIcon
            }, onClick: onClose }),
        React.createElement("div", { style: {
                padding: props.addPadding ? '0px 10px 10px 10px' : undefined
            } },
            React.createElement(Field, null, lib_date_1.date_format_day(req, date, false)),
            ttitem.starttime && React.createElement(Field, null, lib_date_1.date_format_time0(req, ttitem.starttime, { ajSekundy: false })
                + '-'
                + lib_date_1.date_format_time0(req, ttitem.endtime, { ajSekundy: false })),
            React.createElement(asc_react_1.VGap, { height: 15 }),
            dpRow
                ? React.createElement(React.Fragment, null, asc_react_1.wrapSuspense(React.createElement(RDpRow, { dpRow: dpRow, dbi: dbi, date: date, mode: 'ttviewer' })))
                : React.createElement(React.Fragment, null,
                    ttitem.name && React.createElement(Field, null, ttitem.name),
                    ttitem.subjectid && React.createElement(Field, null, itemName('subjects', ttitem.subjectid)),
                    popis["class"] && React.createElement(Field, null, dbi.tools.itemName(ttitem.igroupid ? 'igroups' : 'classes') + ': ' + popis["class"]),
                    ttitem.teacherids.length > 0 && React.createElement(Field, null, itemNames('teachers', ttitem.teacherids)),
                    ttitem.classroomids.length > 0 && React.createElement(Field, null, itemNames('classrooms', ttitem.classroomids)),
                    ttitem.studentids && ttitem.studentids.length > 0 && ttitem.studentids.length <= 3 && React.createElement(Field, null, itemNames('students', ttitem.studentids)),
                    eventids && React.createElement(React.Fragment, null,
                        React.createElement(asc_react_1.VGap, { height: 10 }),
                        eventids.map(function (eventid) { return React.createElement(event_popup_1.EventBar, { key: eventid, eventid: eventid, where: 'timetable' }); })))));
}
exports.TTItemDetails = TTItemDetails;
function openTTOnline() {
    document.location.href = '/timetable/admin.php';
}
function showSettings() {
    ASC.ASC_action("/gcall", {
        gadget: 'TimetableVersionAdmin',
        action: 'settings',
        gsh: ASC.gsechash
    });
}
function showRights() {
    ASC.ASC_action("/gcall", {
        gadget: 'TimetableVersionAdmin',
        action: 'rights',
        gsh: ASC.gsechash
    });
}
function useStateWithDefault(value) {
    var _a = React.useState(undefined), customized = _a[0], setCustomized = _a[1];
    return [
        customized === undefined ? value : customized,
        setCustomized,
    ];
}
function TTViewerDlg(props) {
    var req = asc_react_1.useReq();
    return React.createElement(asc_react_1.RDialog, { width: 1150, height: 750, buttons: ['close'], header: req.ls(1001) },
        React.createElement(TTViewer, tslib_1.__assign({}, props)));
}
function showTTViewerDlg(props) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            asc_react_1.RDialog.show(React.createElement(TTViewerDlg, tslib_1.__assign({}, props)));
            return [2];
        });
    });
}
exports.showTTViewerDlg = showTTViewerDlg;
function ChooseRegularTTDlg(props) {
    var req = asc_react_1.useReq();
    var dbi = dbi_react_1.useMainDBI(req.getSchoolYear(), {
        needed_part: {
            timetables: [
                'stav',
                'name',
                'year',
                'datefrom',
                'dateto',
                'filetime_int',
                '_uial',
            ]
        },
        needed_combos: {
            timetables: ['stav']
        }
    });
    var timetables = dbi.tableData('timetables').filter(function (tt) { return tt._uial > 0; });
    timetables.sort(function (a, b) { return b.filetime_int - a.filetime_int; });
    var cols = [
        'stav',
        'year',
        'name',
        'datefrom',
        'dateto',
    ];
    var selectedIdRef = asc_react_1.useStateValueRef('');
    return React.createElement(asc_react_1.RDialog, { onConfirm: function (rdlg) { return rdlg.confirmClose(selectedIdRef.value); }, width: 700, height: 400, buttons: [
            {
                label: req.ls(1489),
                action: 'view',
                type: selectedIdRef.value ? 'green' : undefined
            },
            'cancel'
        ] },
        React.createElement(datatable_1.RDatatable, { data: timetables, dbi: dbi, dbi_table: 'timetables', cssClass: 'light-theme', columns: cols.map(function (c) { return ({
                key: c,
                width: { name: 200, stav: 100 }[c] || 80
            }); }), fitWidth: true, selectedIdRef: selectedIdRef, idcol: 'id' }));
}
exports._hotswap = [
    TTViewerDlg,
    ChooseRegularTTDlg,
];
