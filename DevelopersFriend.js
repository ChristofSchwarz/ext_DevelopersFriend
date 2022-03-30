define(["qlik", "jquery", "text!./style.css", "./functions", "./props"],
    function (qlik, $, cssContent, functions, props) {
        const hideAd = true;  // show or hide the "by data/\bridge" text 

        'use strict';

        var sessi = {
            databridgeHubUrl: '../extensions/databridge/hub.html',
            baseUrl: location.href.indexOf('/sense/app') > -1 ? location.href.split('/sense/app')[0] : location.href.split('/single')[0],
            xrfkey: Math.random().toString().substr(2).repeat(16).substr(0, 16)
        };
        var qext;

        // find out if this site also has the data/\bridge Hub mashup installed
        if (!sessi.hasDatabridgeHub) $.ajax({
            type: "HEAD",
            url: sessi.databridgeHubUrl,
            success: function (returnData) { sessi.hasDatabridgeHub = true; },
            error: function (xhr, status, error) { sessi.hasDatabridgeHub = false; }
        });

        if (!qext) $.ajax({
            url: '../extensions/DevelopersFriend/DevelopersFriend.qext',
            dataType: 'json',
            async: false,  // wait for this call to finish.
            success: function (data) { qext = data; }
        });


        $("<style>").html(cssContent).appendTo("head");

        return {
            initialProperties: {
                showTitles: false,
                disableNavMenu: true

            },

            definition: {
                type: "items",
                component: "accordion",
                items: [
                    {
                        uses: "dimensions",
                        min: 0,
                        max: 1
                    }, {
                        uses: "settings"
                    }, {
                        uses: "addons",
                        items: [
                            {
                                uses: "dataHandling",
                                items: [
                                    { uses: "calcCond" }
                                ]
                            }
                        ]
                    }, {
                        label: 'Extension Settings',
                        type: 'items',
                        component: 'expandable-items',
                        items: [
                            props.qrsSettings(qlik),
                            props.button1(qlik),
                            props.button2(qlik, sessi),
                            props.button3(qlik),
                            props.button4(qlik),
                            props.button5(qlik),
                            props.button6(qlik),
                            props.button7(qlik),
                            props.presentation(qlik)
                        ]
                    }, {
                        label: 'About this extension',
                        type: 'items',
                        items: props.about(qext)
                    }
                ]
            },

            resize: function ($element, layout) {
                // nothing to do when only resized
                return qlik.Promise.resolve();
            },

            paint: function ($element, layout) {

                var self = this;
                //var ownId = this.options.id;
				const ownId = layout.qInfo.qId;
                console.log('Developer\'s Friend ' + ownId + ' paint method. layout:', layout);
                var app = qlik.currApp(this);

                // turn off (white) bg color of this object
                $('[tid="' + ownId + '"] .qv-inner-object').css('background-color', layout.pNoBkgr ? 'rgba(0,0,0,0)' : '');
                $('[tid="' + ownId + '"] .qv-object').css('border-color', layout.pNoBkgr ? 'rgba(0,0,0,0)' : '');
				if(layout.pNoBkgr) {
					$('[tid="' + ownId + '"] header').hide();
				}

                if (!sessi.hasOwnProperty(ownId)) {
                    sessi[ownId] = {
                        xrfkey: Math.random().toString().substr(2).repeat(16).substr(0, 16),
                        vproxy: layout.pViaVproxy ? ('/' + layout.vproxy) :
                            (location.href.split(location.hostname)[1].split(location.href.indexOf('/sense/app') > -1 ? '/sense/app' : '/single')[0])
                    }
                }
                //var qrsAppInfo;
                //var vproxy;
                console.log("Developer's Friend " + ownId + ' session settings:', sessi);
                /*
                $.ajax({
                    type: "GET",
                    url: sess.databridgeHubUrl,
                    success: function (returnData) {sess.hasDatabridgeHub = true; },
                    error: function (xhr, status, error) { sess.hasDatabridgeHub = false; }
                });
                */

                function buttonHTML(id) {

                    if (id == 1) {
                        return (layout.pIconTxt.indexOf('i') > -1 ? '<span class="lui-icon__icon lui-icon lui-icon--reload"></span>&nbsp;' : '')
                            + (layout.pIconTxt.indexOf('t') > -1 ? layout.pBtnLabel1 : '')
                    } else if (id == 2) {
                        return (layout.pIconTxt.indexOf('i') > -1 ? '<span class="lui-icon__icon lui-icon lui-icon--upload"></span>&nbsp;' : '')
                            + (layout.pIconTxt.indexOf('t') > -1 ? layout.pBtnLabel2 : '')
                    } else if (id == 3) {
                        return (layout.pIconTxt.indexOf('i') > -1 ? '<span class="lui-icon__icon lui-icon lui-icon--cogwheel"></span>&nbsp;' : '')
                            + (layout.pIconTxt.indexOf('t') > -1 ? layout.pBtnLabel3 : '')
                    } else if (id == 4) {
                        return (layout.pIconTxt.indexOf('i') > -1 ? '<span class="lui-icon__icon lui-icon lui-icon--export"></span>&nbsp;' : '')
                            + (layout.pIconTxt.indexOf('t') > -1 ? layout.pBtnLabel4 : '')
                    } else if (id == 5) {
                        return (layout.pIconTxt.indexOf('i') > -1 ? '<span class="lui-icon__icon lui-icon lui-icon--direct-discovery"></span>&nbsp;' : '')
                            + (layout.pIconTxt.indexOf('t') > -1 ? layout.pBtnLabel5 : '')
                    } else if (id == 6) {
                        return (layout.pIconTxt.indexOf('i') > -1 ? '<span class="lui-icon__icon lui-icon lui-icon--bin"></span>&nbsp;' : '')
                            + (layout.pIconTxt.indexOf('t') > -1 ? layout.pBtnLabel6 : '')
                    } else if (id == 7) {
                        return (layout.pIconTxt.indexOf('i') > -1 ? '<span class="lui-icon__icon lui-icon lui-icon--object"></span>&nbsp;' : '')
                            + (layout.pIconTxt.indexOf('t') > -1 ? layout.pBtnLabel7 : '')
                    } else {
                        return 'invalid id in function buttonHTML'
                    }
                };


                var html = hideAd ? '' : (
                    '<div class="developersFriend-welcome">Developer\'s Friend by '
                    + '<a href="https://www.databridge.ch" target="_blank" style="color:#0A2C4D;font-weight:bold;" >'
                    + 'data<span style="color:#F0C131;">/\\</span>bridge</a></div>'
                );
                html += '<div id="formulaWarning_' + ownId + '" style="color:red; display:none;">Please edit the condition formula, press the <b><i>fx</i></b> button</div>'
                    + '<div id="button_parent_' + ownId + '">'
                    + '<button id="btn1_' + ownId + '" class="lui-button developersFriend-ellipsis" style="display:none;" />' + buttonHTML(1) + '</button>'
                    + '<button id="btn2_' + ownId + '" class="lui-button developersFriend-ellipsis" style="display:none;" />' + buttonHTML(2) + '</button>'
                    + '<button id="btn3_' + ownId + '" class="lui-button developersFriend-ellipsis" style="display:none;" />' + buttonHTML(3) + '</button>'
                    + '<button id="btn4_' + ownId + '" class="lui-button developersFriend-ellipsis" style="display:none;" />' + buttonHTML(4) + '</button>'
                    + '<button id="btn5_' + ownId + '" class="lui-button developersFriend-ellipsis" style="display:none;" />' + buttonHTML(5) + '</button>'
                    + '<button id="btn6_' + ownId + '" class="lui-button developersFriend-ellipsis" style="display:none;" />' + buttonHTML(6) + '</button>'
                    + '<button id="btn7_' + ownId + '" class="lui-button developersFriend-ellipsis" style="display:none;" />' + buttonHTML(7) + '</button>'
                    + '</div>';

                if ($element.html() == "") {
                    $element.html(html);
                    // Functionality of RELOAD button
                    $("#btn1_" + ownId).on("click", function () {
                        console.log('Reload button clicked.');
                        functions.btnClick1($, ownId, app, layout, sessi[ownId].vproxy, httpHeader);
                    });
                    // Functionality of REPLACE button
                    $("#btn2_" + ownId).on("click", async function () {
                        console.log("Button2 clicked.");
                        functions.btnClick2($, ownId, app, layout, sessi[ownId].vproxy, httpHeader, sessi.databridgeHubUrl); //, global);
                    });
                    // Functionality of STREAM button
                    $("#btn3_" + ownId).on("click", async function () {
                        functions.btnClick3($, ownId, app, layout, sessi[ownId].vproxy, httpHeader);
                    });
                    // Functionality of EXPORT button
                    $("#btn4_" + ownId).on("click", function () {
                        console.log('Button4 clicked.');
                        functions.btnClick4($, ownId, app, layout, sessi[ownId].vproxy, httpHeader);
                    });
                    // Functionality of MAPPING button
                    $("#btn5_" + ownId).on("click", function () {
                        console.log('Button5 clicked.');
                        functions.btnClick5($, ownId, app, layout, sessi[ownId].vproxy, httpHeader);
                    });
                    // Functionality of DELETE button
                    $("#btn6_" + ownId).on("click", function () {
                        console.log('Button6 clicked.');
                        functions.btnClick6($, ownId, app, layout, sessi[ownId].vproxy, httpHeader);
                    });
                    // Functionality of IFRAME button
                    $('#btn7_' + ownId).click(function () {
                        console.log('button 7 clicked');
						if (layout.pSetThisVariable3) {
							app.variable.setStringValue(layout.pSetThisVariable3, layout.pSetVariableValue3);
						};
                        functions.showiframe(ownId, layout.pIframeTitle, layout.pIframeSrc, 'Schließen');
						
                        $('#msgparent_' + ownId + ' .lui-dialog').css('width', '90%').css('height', ($('#qv-page-container').height() * .9) + 'px');
                        // $('#msgparent_' + ownId + ' .lui-dialog__body').css('padding', '0')
                        //    .html('<iframe style="width:' + (99) + '%;height:' + (99) + '%;/*transform: scale(.8);*/"'
                        //        + 'src="https://bi.stiglechner.at/single/?appid=7206aa4a-1922-466d-afcb-a8d76fc46acf&sheet=d7167ea4-8d94-4cf1-9054-9a01d4ce7e8e&opt=ctxmenu,currsel" />');
                    });
                }

                // updating the elements without repainting entire extension html
                $('#button_parent_' + ownId + ' button').css('width', 'calc(' + layout.pBtnWidth2 + "% - 2px)");


                if (layout.pCBshowIfFormula == true && layout.pShowCondition.substr(0, 1) == '=') {
                    $('#formulaWarning_' + ownId).show();
                } else {
                    $('#formulaWarning_' + ownId).hide();
                }

                //var localEnigma = app.model.enigmaModel;

                var randomKey = Math.random().toString().substr(2).repeat(16).substr(0, 16);
                var httpHeader = {};
                if (layout.pViaVproxy) httpHeader[layout.hdrkey] = layout.hdrval;
                httpHeader["X-Qlik-Xrfkey"] = randomKey;

                // Draw the html buttons		


                var renderBtn1 = layout.pCBreload;
                if (layout.pCBshowIfFormula)
                    if (layout.pShowCondition == 0) renderBtn1 = false;

                if (renderBtn1) {
                    $('#btn1_' + ownId).show();
                    $('#btn1_' + ownId).css('color', layout.pTxtColor1.color ? layout.pTxtColor1.color : layout.pTxtColor1);
                    $('#btn1_' + ownId).css('background-color', layout.pBgColor1.color ? layout.pBgColor1.color : layout.pBgColor1);
                    setTimeout(function () {
                        $('#btn1_' + ownId).html(buttonHTML(1));
                    }, $('#btn1_' + ownId).text().match(/(\([0-9]|\.\.\.)/) ? 6000 : 1);
                    // if the button text contains " (#" or "..." wait 6s before returning to default. This is because the reload 
                    // was clicked before and the text in the button was used for update info of reloads

                } else {
                    $('#btn1_' + ownId).hide();
                }

                var renderBtn2 = layout.pCBreplace;
                if (app.id.toUpperCase() == layout.pTargetAppId.toUpperCase()) renderBtn2 = false;
                if (renderBtn2) {
                    $('#btn2_' + ownId).show();
                    $('#btn2_' + ownId).css('color', layout.pTxtColor2.color ? layout.pTxtColor2.color : layout.pTxtColor2);
                    $('#btn2_' + ownId).css('background-color', layout.pBgColor2.color ? layout.pBgColor2.color : layout.pBgColor2);
                    $('#btn2_' + ownId).html(buttonHTML(2));
                } else {
                    $('#btn2_' + ownId).hide();
                }

                var renderBtn3 = layout.pCBstream;
                if (renderBtn3) {
                    $('#btn3_' + ownId).show();
                    $('#btn3_' + ownId).css('color', layout.pTxtColor2.color ? layout.pTxtColor3.color : layout.pTxtColor3);
                    $('#btn3_' + ownId).css('background-color', layout.pBgColor3.color ? layout.pBgColor3.color : layout.pBgColor3);
                    $('#btn3_' + ownId).html(buttonHTML(3));
                } else {
                    $('#btn3_' + ownId).hide();
                }

                var renderBtn4 = layout.pCBexport;
                if (renderBtn4) {
                    $('#btn4_' + ownId).show();
                    $('#btn4_' + ownId).css('color', layout.pTxtColor4.color ? layout.pTxtColor4.color : layout.pTxtColor4);
                    $('#btn4_' + ownId).css('background-color', layout.pBgColor4.color ? layout.pBgColor4.color : layout.pBgColor4);
                    $('#btn4_' + ownId).html(buttonHTML(4));
                } else {
                    $('#btn4_' + ownId).hide();
                }

                var renderBtn5 = layout.pCBmappings;
                if (renderBtn5) {
                    $('#btn5_' + ownId).show();
                    $('#btn5_' + ownId).css('color', layout.pTxtColor5.color ? layout.pTxtColor5.color : layout.pTxtColor5);
                    $('#btn5_' + ownId).css('background-color', layout.pBgColor5.color ? layout.pBgColor5.color : layout.pBgColor5);
                    $('#btn5_' + ownId).html(buttonHTML(5));
                } else {
                    $('#btn5_' + ownId).hide();
                }

                var renderBtn6 = layout.pCBdelete;
                if (renderBtn6) {
                    $('#btn6_' + ownId).show();
                    $('#btn6_' + ownId).css('color', layout.pTxtColor6.color ? layout.pTxtColor6.color : layout.pTxtColor6);
                    $('#btn6_' + ownId).css('background-color', layout.pBgColor6.color ? layout.pBgColor6.color : layout.pBgColor6);
                    $('#btn6_' + ownId).html(buttonHTML(6));
                } else {
                    $('#btn6_' + ownId).hide();
                }


                var renderBtn7 = layout.pCBiframe;
                if (renderBtn7) {
                    $('#btn7_' + ownId).show();
					$('#btn7_' + ownId).css('color', layout.pTxtColor7.color ? layout.pTxtColor7.color : layout.pTxtColor7);
                    $('#btn7_' + ownId).css('background-color', layout.pBgColor7.color ? layout.pBgColor7.color : layout.pBgColor7);
                    $('#btn7_' + ownId).html(buttonHTML(7));
                } else {
                    $('#btn7_' + ownId).hide();
                }

                if (!sessi.user) {
                    $.ajax({
                        type: "GET",
                        url: sessi.baseUrl + '/qps/user?xrfkey=' + sessi.xrfkey,
                        header: { "X-Qlik-Xrfkey": sessi.xrfkey },
                        success: function (res) { console.log('QPS user info', res); sessi.user = res },
                        error: function (xhr, status, error) { console.log('QPS user info failed', error); }
                    })
                }
                // Checking the Extension Settings about Virtual Proxy / QRS API access

                if (!sessi.qrsAppInfo) {
                    $.ajax({
                        method: 'GET',
                        url: sessi[ownId].vproxy + '/qrs/app?filter=id eq ' + app.id + '&xrfkey=' + randomKey,
                        headers: httpHeader,
                        success: function (res) {
                            console.log('Success: QRS API is talking to you on ' + sessi[ownId].vproxy + '/qrs');
                            sessi.qrsAppInfo = res[0];
                            if (sessi.qrsAppInfo && layout.pCBhideIfPublic && sessi.qrsAppInfo.stream != null) $("#btn1_" + ownId).hide();
                        },
                        error: function (xhr, status, error) {
                            console.log(sessi[ownId].vproxy + '/qrs/app call failed', error);
                        }
                    })
                }
                return qlik.Promise.resolve();
            }
        };
    });
