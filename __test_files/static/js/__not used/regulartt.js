"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
var React = require("react");
var asc_react_1 = require("../asc/asc_react");
var dbi_1 = require("../rpr/dbi");
var edurequest_1 = require("../asc/edurequest");
var regulartt_1 = require("./server/regulartt");
var ttdoc_1 = require("./app/ttdoc");
var rokobject_1 = require("./app/rokobject");
var print_1 = require("./app/print");
var ttviewer_1 = require("./ttviewer");
var ttview_components_1 = require("./ttview_components");
var timetable_1 = require("../substitution/online/timetable");
var ttitem_1 = require("./ttitem");
function RegularTTView(props) {
    var tt_num = props.tt_num;
    var req = edurequest_1.client_req;
    var data = asc_react_1.useAsyncMemo(function () { return props.ttdata ? Promise.resolve(props.ttdata) : regulartt_1.regularttGetData(null, tt_num); }, [tt_num], { rights: {} }, { interactive: false });
    var dbi = React.useMemo(function () {
        if (data.dbiAccessorRes)
            return dbi_1.DBI.fromAccessorResult(req, data.dbiAccessorRes);
        return null;
    }, [data]);
    var mode = props.mode || 'svg';
    if (props.oblast.endsWith('_summary'))
        mode = 'svg';
    var onTTItemClick = props.onTTItemClick;
    if (req.isApp()) {
        onTTItemClick = function (ti) { return asc_react_1.RDialog.show(React.createElement(asc_react_1.RDialog, { header: req.ls(1920), width: 300, buttons: req.isApp() ? [] : ['close'], noPadding: true },
            React.createElement(ttviewer_1.TTItemDetails, { ttitem: ti, dbi: dbi, addPadding: true }))); };
    }
    return mode == 'html'
        ? React.createElement(RegularTTView_HTML, tslib_1.__assign({}, props, { dbi: dbi, data: data, onTTItemClick: onTTItemClick }))
        : React.createElement(RegularTTView_SVG, tslib_1.__assign({}, props, { dbi: dbi, data: data }));
}
exports.RegularTTView = RegularTTView;
RegularTTView.npp = dbi_1.neededPartProvider(function () { return [
    RegularTTView_HTML,
    RegularTTView_SVG,
]; });
function RegularTTView_SVG(props) {
    var dbi = props.dbi, data = props.data, disableColors = props.disableColors, oblast = props.oblast, id = props.id, buildButtonsPortal = props.buildButtonsPortal, fixTTColors = props.fixTTColors;
    var _a = asc_react_1.useClientSize(), width = _a[0], height = _a[1], wrap_ref = _a[2];
    var sheet_ref = React.useRef();
    var _b = React.useState(0), page = _b[0], setPage = _b[1];
    var _c = React.useState(props.fit ? -1 : 4), zoom = _c[0], setZoom = _c[1];
    var req = asc_react_1.useReq();
    var printPages = React.useMemo(function () {
        if (!dbi)
            return [];
        var pRok = dbi2rok(dbi);
        var ttreportid = ttviewerOblast2ttreportid(dbi, oblast);
        if (!ttreportid)
            return [];
        var filter = {};
        if (id)
            filter[oblast] = [id];
        var tz = pRok.m_ObjectsI.ttreports[ttreportid];
        tz.m_bTTViewerDisableCardColor = !!disableColors;
        return tz.Render({
            filter: filter,
            m_bTTViewer: false,
            fixTTColors: fixTTColors
        });
    }, [dbi, disableColors, oblast, id, fixTTColors]);
    React.useEffect(function () {
        if (page >= printPages.length)
            setPage(0);
    }, [page, printPages]);
    var printPage = printPages[page];
    React.useEffect(function () {
        if (props.setViewData && data) {
            var ttreport = dbi ? dbi.rowData('ttreports', ttviewerOblast2ttreportid(dbi, oblast)) : null;
            props.setViewData({
                dbi: dbi,
                rights: data.rights,
                colorsEnabled: ttreport ? ttreport.cardcolorenabled : false,
                print: function () { return print_1.printPagesPrint([printPage]); }
            });
        }
    }, [data, dbi, oblast, printPage]);
    var realZoom = zoom;
    if (printPage && zoom < 0) {
        realZoom = Math.min(width / printPage.width, height / printPage.height) * 10;
    }
    React.useEffect(function () {
        var $sheet = $j(sheet_ref.current);
        $sheet.empty();
        if (printPage) {
            printPage.$sheet = $sheet;
            var scale = realZoom;
            printPage.RenderSheet($sheet, scale, false);
        }
        else {
            $sheet.text(req.ls(8467));
        }
    }, [page, printPages, realZoom]);
    var menu = [];
    if (printPages.length > 1) {
        menu.push({
            id: 'prevWeek',
            icon: '/static/pics/preview_back_32.png',
            onclick: page > 0 ? function () { return setPage(page - 1); } : undefined
        });
        menu.push({
            id: 'nextWeek',
            icon: '/static/pics/preview_forward_32.png',
            onclick: page + 1 < printPages.length ? function () { return setPage(page + 1); } : undefined
        });
    }
    {
        var zooms = [2, 3, 4, 6, 10];
        var z_plus_1 = -1;
        var z_minus_1 = -1;
        var min_ratio_1 = 1.1;
        zooms.forEach(function (z) {
            if (z < realZoom / min_ratio_1)
                z_minus_1 = z;
            if (z > realZoom * min_ratio_1 && z_plus_1 < 0)
                z_plus_1 = z;
        });
        if (menu.length > 0)
            menu.push([]);
        menu.push({
            icon: '/static/pics/zoom_plus_32.png',
            onclick: z_plus_1 > 0
                ? function () { return setZoom(z_plus_1); }
                : undefined
        });
        menu.push({
            icon: '/static/pics/zoom_minus_32.png',
            onclick: z_minus_1 > 0
                ? function () { return setZoom(z_minus_1); }
                : undefined
        });
        if (zoom > 0) {
            menu.push({
                text: req.ls(1915),
                onclick: function () { return setZoom(-1); }
            });
        }
    }
    return React.createElement(React.Fragment, null,
        React.createElement("div", { ref: wrap_ref, className: 'print-nobreak', style: tslib_1.__assign({ position: 'relative', overflow: 'auto' }, props.style || {}) },
            React.createElement("div", { ref: sheet_ref, style: {
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    position: 'relative'
                } })),
        buildButtonsPortal && buildButtonsPortal(menu));
}
RegularTTView_SVG.npp = dbi_1.neededPartProvider(function () { return [rokobject_1.ttapp_needed_part]; });
function RegularTTView_HTML(props) {
    var _a, _b, _c, _d, _e;
    var dbi = props.dbi, data = props.data, oblast = props.oblast, id = props.id, fixTTColors = props.fixTTColors, buildButtonsPortal = props.buildButtonsPortal;
    var showHeader = (_a = props.showHeader) !== null && _a !== void 0 ? _a : true;
    var _f = asc_react_1.useClientSize(), clientWidth = _f[0], clientHeight = _f[1], ref = _f[2];
    clientWidth = (_b = props.clientWidth) !== null && _b !== void 0 ? _b : clientWidth;
    clientHeight = (_c = props.clientHeight) !== null && _c !== void 0 ? _c : clientHeight;
    var colors = asc_react_1.useColors();
    var _g = React.useState(0), week = _g[0], setWeek = _g[1];
    var _h = React.useState(0), term = _h[0], setTerm = _h[1];
    React.useEffect(function () {
        if (props.setViewData && data) {
            var ttreport_1 = dbi ? dbi.rowData('ttreports', ttviewerOblast2ttreportid(dbi, oblast)) : null;
            props.setViewData({
                dbi: dbi,
                rights: data.rights,
                colorsEnabled: ttreport_1 ? ttreport_1.cardcolorenabled : false
            });
        }
    }, [data, dbi, oblast]);
    var table = oblast;
    var classid = '';
    if (table == 'classes')
        classid = id;
    if (table == 'students') {
        classid = ((_d = dbi === null || dbi === void 0 ? void 0 : dbi.rowData('students', id)) === null || _d === void 0 ? void 0 : _d.classid) || '';
    }
    var ttreport = dbi === null || dbi === void 0 ? void 0 : dbi.rowData('ttreports', ttviewerOblast2ttreportid(dbi, oblast));
    var color_table = !props.disableColors && (ttreport === null || ttreport === void 0 ? void 0 : ttreport.cardcolorenabled) && ((ttreport === null || ttreport === void 0 ? void 0 : ttreport.cardcolortable1) || (table == 'teachers' ? 'classes' : 'teachers'));
    var ttitems = React.useMemo(function () {
        if (!dbi)
            return [];
        var ttitems = [];
        for (var _i = 0, _a = dbi.tableData('cards'); _i < _a.length; _i++) {
            var card = _a[_i];
            if (!card.days)
                continue;
            var lrow = dbi.rowData('lessons', card.lessonid);
            var ttitem = {
                type: 'card',
                days: card.days,
                weeks: card.weeks,
                terms: lrow.terms,
                date: '',
                uniperiod: card.period,
                starttime: '',
                endtime: '',
                subjectid: lrow.subjectid,
                classids: lrow.classids,
                teacherids: lrow.teacherids,
                groupnames: lrow.groupnames,
                classroomids: card.classroomids,
                studentids: lrow.studentids,
                durationperiods: lrow.durationperiods
            };
            if (!ttitem_1.ttitemFilterMatch(ttitem, table, id))
                continue;
            if (table == 'classes') {
                var firstGrow = dbi.rowDatas('groups', lrow.groupids).find(function (grow) { return grow.classid == id; });
                if (firstGrow) {
                    var drow = dbi.rowData('divisions', firstGrow.divisionid);
                    ttitem.cellSlices = '';
                    for (var _b = 0, _c = drow.groupids; _b < _c.length; _b++) {
                        var groupid = _c[_b];
                        ttitem.cellSlices += lrow.groupids.includes(groupid) ? '1' : '0';
                    }
                }
            }
            ttitems.push(ttitem);
        }
        if (data.rights.classroomsupervision && (table == 'teachers' || table == 'classrooms')) {
            var days_1 = dbi.tableIds('days');
            var _loop_1 = function (dozor) {
                var moje = false;
                if (table == 'teachers')
                    moje = dozor.teacherid == id;
                if (table == 'classrooms')
                    moje = dozor.classroomid == id;
                if (!moje)
                    return "continue";
                var ttitem = {
                    type: 'classroomsupervision',
                    days: days_1.map(function (day) { return dozor.day == day ? '1' : '0'; }).join(''),
                    weeks: dozor.weeks,
                    date: '',
                    uniperiod: dbi_1.DBITools.getUniPeriod(dozor),
                    starttime: '',
                    endtime: '',
                    subjectid: '',
                    classids: [],
                    teacherids: dozor.teacherid ? [dozor.teacherid] : [],
                    groupnames: [],
                    classroomids: [dozor.classroomid]
                };
                ttitems.push(ttitem);
            };
            for (var _d = 0, _e = dbi.tableData('classroomsupervisions') || []; _d < _e.length; _d++) {
                var dozor = _e[_d];
                _loop_1(dozor);
            }
        }
        for (var _f = 0, ttitems_1 = ttitems; _f < ttitems_1.length; _f++) {
            var ttitem = ttitems_1[_f];
            if (color_table) {
                ttitem.colors = ttitem_1.ttitemTableIds(ttitem, color_table).map(function (id) { var _a; return (_a = dbi.rowData(color_table, id)) === null || _a === void 0 ? void 0 : _a['color']; }).filter(function (c) { return c; });
                if (fixTTColors)
                    ttitem.colors = ttitem.colors.map(function (c) { return ttdoc_1.fixTTColor(c, colors.darkMode); });
            }
        }
        return ttitems;
    }, [dbi, table, id, color_table, fixTTColors, colors.darkMode]);
    var showObdobie = React.useMemo(function () {
        var _a, _b;
        var showObdobie = {
            terms: false,
            weeks: false
        };
        for (var _i = 0, ttitems_2 = ttitems; _i < ttitems_2.length; _i++) {
            var ti = ttitems_2[_i];
            if ((_a = ti.weeks) === null || _a === void 0 ? void 0 : _a.includes('0'))
                showObdobie.weeks = true;
            if ((_b = ti.terms) === null || _b === void 0 ? void 0 : _b.includes('0'))
                showObdobie.terms = true;
        }
        return showObdobie;
    }, [ttitems]);
    if (!(dbi && ttreport))
        return null;
    var periods = dbi.tableData('periods');
    var fromPeriod = dbi.rowData('periods', '0') ? 0 : 1;
    var nPeriods = periods.length || 1;
    if (classid) {
        var bell = (_e = dbi.rowData('classes', classid)) === null || _e === void 0 ? void 0 : _e.bell;
        if (bell) {
            var brow_1 = dbi.rowData('bells', bell);
            periods = periods.map(function (prow) {
                var pd = dbi_1.patchmissingobj(brow_1 === null || brow_1 === void 0 ? void 0 : brow_1.perioddata[prow.id], {});
                return tslib_1.__assign(tslib_1.__assign({}, prow), { starttime: pd.starttime || prow.starttime, endtime: pd.endtime || prow.endtime });
            });
        }
    }
    var days = dbi.tableData('days');
    var swapAxis = ttreport.row_tables.includes('periods');
    var _j = ttview_components_1.calcTTViewBoxes({
        clientWidth: clientWidth,
        clientHeight: clientHeight,
        fit: false,
        swapAxis: swapAxis,
        showHeader: showHeader,
        time_mode: false,
        nDays: days.length || 1,
        nPeriods: nPeriods
    }), gap = _j.gap, gap_day = _j.gap_day, ttWidth = _j.ttWidth, periodHeight = _j.periodHeight, rowHeight = _j.rowHeight, dayWidth = _j.dayWidth, headerWidth = _j.headerWidth, headerHeight = _j.headerHeight, ttBox = _j.ttBox, ttRowBox = _j.ttRowBox, weekBox = _j.weekBox;
    var tlr = new timetable_1.TimetableLayoutRenderer(ttWidth, periodHeight, fromPeriod, fromPeriod + nPeriods);
    tlr.qSide = 18;
    tlr.gap = gap;
    tlr.data2t = function (data) {
        var _a;
        var uniperiod = data['period'] || data['uniperiod'];
        if (uniperiod[0] == 'b') {
            var t1_1 = parseInt(uniperiod.substr(1));
            return {
                t1: t1_1,
                t2: t1_1
            };
        }
        var t1 = parseInt(uniperiod);
        var durationperiods = (_a = data['durationperiods']) !== null && _a !== void 0 ? _a : 1;
        return {
            t1: t1,
            t2: t1 + durationperiods
        };
    };
    var menu = [];
    if (showObdobie.terms || showObdobie.weeks) {
        menu.push({
            id: 'prevWeek',
            icon: '/static/pics/preview_back_32.png',
            onclick: week > 0 || term > 0
                ? function () {
                    if (week > 0) {
                        setWeek(week - 1);
                    }
                    else {
                        setWeek(dbi.tableData('weeks').length - 1);
                        setTerm(term - 1);
                    }
                }
                : undefined
        });
        menu.push({
            id: 'nextWeek',
            icon: '/static/pics/preview_forward_32.png',
            onclick: term + 1 < dbi.tableData('terms').length || week + 1 < dbi.tableData('weeks').length
                ? function () {
                    if (week + 1 < dbi.tableData('weeks').length) {
                        setWeek(week + 1);
                    }
                    else {
                        setWeek(0);
                        setTerm(term + 1);
                    }
                }
                : undefined
        });
    }
    return React.createElement(React.Fragment, null,
        React.createElement("div", { ref: ref, style: tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, ttview_components_1.ttview_div_style), { backgroundColor: colors.bgWhite, color: colors.fgBlack }), props.style || {}) },
            React.createElement(ttview_components_1.TTView_PageHeader, { dbi: dbi, table: table, id: id, headerWidth: headerWidth, headerHeight: headerHeight }),
            React.createElement(ttview_components_1.TTView_Boxes, { ttBox: ttBox, swapAxis: swapAxis, periods: React.createElement(ttview_components_1.TTView_Periods, { dbi: dbi, periodHeight: periodHeight, tlr: tlr, swapAxis: swapAxis, showTime: true, periods: dbi_1.unpartial_array(periods) }), days: days.map(function (day, i) {
                    var y1 = rowHeight * i;
                    var box = {
                        x1: 0,
                        x2: dayWidth,
                        y1: y1,
                        y2: y1 + rowHeight
                    };
                    return React.createElement(ttview_components_1.TTView_Object, { key: day.id, box: box, dbi: dbi, table: 'days', id: day.id, splitLineTop: i > 0, swap: swapAxis });
                }), tt: days.map(function (day, i) { return React.createElement(ttview_components_1.TTView_TTDay, { key: i, dbi: dbi, box: ttRowBox(i), gap_day: gap_day, table: oblast, id: id, tlr: tlr, ttitems: ttitems.filter(function (ti) { var _a, _b; return ti.days[i] == '1' && ((_a = ti.weeks) === null || _a === void 0 ? void 0 : _a[week]) != '0' && ((_b = ti.terms) === null || _b === void 0 ? void 0 : _b[term]) != '0'; }), onTTItemClick: props.onTTItemClick, selectedTTItem: props.selectedTTItem, swapAxis: swapAxis }); }), corner: React.createElement(asc_react_1.RTextBox, tslib_1.__assign({}, asc_react_1.swapBox(weekBox, swapAxis), { vAlign: 'center', text: [['terms', term], ['weeks', week]].map(function (_a) {
                        var t = _a[0], i = _a[1];
                        return showObdobie[t] && React.createElement("div", { key: t, style: { textAlign: 'center' } }, dbi.rowName(t, '' + i));
                    }) })) })),
        buildButtonsPortal && buildButtonsPortal(menu));
}
RegularTTView_HTML.needed_part = dbi_1.typed({
    students: ['classid'],
    classes: ['classroomid'],
    lessons: ['studentids', 'groupnames'],
    groups: ['classid', 'divisionid'],
    divisions: ['groupids'],
    days: ['__name'],
    weeks: ['__name'],
    terms: ['__name'],
    classroomsupervisions: ['weeks']
});
function dbi2rok(dbi) {
    var pRok = new rokobject_1.CRok();
    for (var t in rokobject_1.ttapp_needed_part) {
        if (!pRok.m_ObjectsI[t])
            continue;
        for (var _i = 0, _a = dbi.tableData(t); _i < _a.length; _i++) {
            var row = _a[_i];
            pRok.addRow(t, row);
            pRok.dbi.addRow(t, row);
        }
    }
    pRok.StructureFromData();
    return pRok;
}
function ttviewerOblast2ttreportid(dbi, oblast) {
    for (var _i = 0, _a = dbi.tableData('ttreports'); _i < _a.length; _i++) {
        var ttreport = _a[_i];
        if (oblast == 'teachers_summary' && ttreport.typ == 6)
            return ttreport.id;
        if (oblast == 'classes_summary' && ttreport.typ == 5)
            return ttreport.id;
        if (oblast == 'classrooms_summary' && ttreport.typ == 7)
            return ttreport.id;
        if (ttreport.page_tables.includes(oblast))
            return ttreport.id;
    }
    return '';
}
exports._hotswap = [
    RegularTTView_SVG,
];
