// functions needed in DevelopersFriend.js ...

define([], function () {


    function progressBar(perc) {
        return '<div style="width:100%;height:10px;background-color:white;border:1px solid black">'
            + '<div style="width:' + Math.round(perc * 100) + '%;height:10px;background-color:green;">&nbsp;</div>'
            + '</div>';
    }

    //=============================================================================================
    function leonardoMsg(ownId, title, detail, ok, cancel, inverse) {
        //=========================================================================================
        // This html was found on https://qlik-oss.github.io/leonardo-ui/dialog.html

        var node = document.createElement("div");
        node.id = "msgparent_" + ownId;
        var html =
            '  <div class="lui-modal-background"></div>' +
            '  <div class="lui-dialog' + (inverse ? '  lui-dialog--inverse' : '') + '" style="width: 400px;top:80px;">' +
            '    <div class="lui-dialog__header">' +
            '      <div class="lui-dialog__title">' + title + '</div>' +
            '    </div>' +
            '    <div class="lui-dialog__body">' +
            detail +
            '    </div>' +
            '    <div class="lui-dialog__footer">';
        if (cancel) {
            html +=
                '  <button class="lui-button  lui-dialog__button' + (inverse ? '  lui-button--inverse' : '') + '" ' +
                '   onclick="var elem=document.getElementById(\'msgparent_' + ownId + '\');elem.parentNode.removeChild(elem);">' +
                cancel +
                ' </button>'
        }
        if (ok) {
            html +=
                '  <button class="lui-button  lui-dialog__button  ' + (inverse ? '  lui-button--inverse' : '') + '" id="msgok_' + ownId + '">' +
                ok +
                ' </button>'
        };
        html +=
            '     </div>' +
            '  </div>';
        node.innerHTML = html;
        document.getElementById("qs-page-container").append(node);
    }

    //=============================================================================================
    async function doAjax(method, url, ownId, httpHeader, body) {
        //=========================================================================================

        let result;
        try {
            // if the url doesn't contain querystring "xrfkey" add it.
            if (url.indexOf('xrfkey') == -1) {
                url += (url.indexOf('?') == -1 ? '?xrfkey=' : '&xrfkey=') + Math.random().toString().substr(2).repeat(8).substr(0, 16);
            }
            var args = {
                timeout: 0,
                method: method,
                url: url,
                headers: httpHeader
            };
            if (body) args.data = body;
            // set querystring xrfkey also as http-request-header X-Qlik-Xrfkey
            args.headers["X-Qlik-Xrfkey"] = url.split('xrfkey=')[1].substr(0, 16);
            // if method isn't GET then set Content-Type in http-request-header 
            if (method.toUpperCase() != 'GET') args.headers["Content-Type"] = 'application/json';
            console.log('$.ajax request', args);
            result = await $.ajax(args);
            console.log('$.ajax response', result);
            return result;
        } catch (error) {
            leonardoMsg(ownId, 'Error', error.status + ' ' + error.responseText, null, 'Close', true);
            console.log('error', error.status + ' ' + error.responseText);
        }
    }

    return {

        // nice messagebox using Leonardo UI style by Qlik 	
        leonardoMsg: function (ownId, title, detail, ok, cancel, inverse) {
            leonardoMsg(ownId, title, detail, ok, cancel, inverse);
        },

        //=============================================================================================
        btnClick1: async function ($, ownId, app, layout) {
            //=========================================================================================
            var btnBefore = $('#btn1_' + ownId).html();
            $('#btn1_' + ownId).text('Reloading...').prop('disabled', true);
            try {
                var httpHeader = {};
                httpHeader[layout.hdrkey] = layout.hdrval;
                await doAjax('POST', '/' + layout.vproxy + '/qrs/app/' + app.id + '/reload', ownId, httpHeader);

                leonardoMsg(ownId, 'Info',
                    'Reload is executing in the background.<hr />'
                    + 'Status: <span id="' + ownId + '_rldstat">...</span>'
                    , 'Close', null, false);

                var timer;
                var watchThisTask;
                $('#msgok_' + ownId).on('click', function () {
                    clearInterval(timer);
                    $('#msgparent_' + ownId).remove();
                });

                
                // get list of "Manually" tasks for this app
                var tasks = await doAjax('GET', '/' + layout.vproxy +
                    "/qrs/reloadtask?filter=name sw 'Manually' and app.id eq " + app.id
                    , ownId, httpHeader);
                if (tasks.length == 1) {
                    watchThisTask = tasks[0].id;
                    timer = setInterval(checkTaskProgress, 3000, watchThisTask);
                } else {
                    $('#' + ownId + '_rldstat').text('multiple tasks found, cannot check.');
                }
                // text codes for the statuses
                var statusList = ('0,1,Running,3,4,5,6,Finished,Failed').split(',');

                function checkTaskProgress(watchThisTask) {
                    $('#' + ownId + '_rldstat').text('');
                    doAjax('GET', '/' + layout.vproxy + "/qrs/reloadtask/" + watchThisTask, ownId, httpHeader)
                        .then(function (task) {
                            if (task.operational && task.operational.lastExecutionResult) {
                                var status = task.operational.lastExecutionResult.status;
                                if (statusList[status]) status = statusList[status];
                                $('#' + ownId + '_rldstat').text(status);
                                if (task.operational.lastExecutionResult.duration > 0) {
                                    clearInterval(timer);
                                    console.log('Reload Task finished:');
                                }
                            }
                        });
                }


                $('#btn1_' + ownId).html(btnBefore).prop('disabled', false);
            } catch (error) {
                leonardoMsg(ownId, 'Error', error, null, 'Close', true);
            }
        },

        //=============================================================================================
        btnClick2: async function ($, ownId, app, layout, global) {
            //=========================================================================================
            var btnBefore = $('#btn2_' + ownId).html();
            var httpHeader = {};
            httpHeader[layout.hdrkey] = layout.hdrval;

            var targetAppInfo = await doAjax('GET', '/' + layout.vproxy + '/qrs/app/full?filter=id%20eq%20' + layout.pTargetAppId, ownId, httpHeader)
            //console.log('targetAppInfo', targetAppInfo);
            if (targetAppInfo.length == 0) {
                return leonardoMsg(ownId, 'Error', 'Invalid target app id.', null, 'Close', true);
            }
            leonardoMsg(ownId, 'Confirm app replacement',
                'Really want to replace design of app "' + targetAppInfo[0].name + '"?<br/>'
                + (targetAppInfo[0].stream ? ('The app is published in stream "' + targetAppInfo[0].stream.name + '"') : 'The app is not published.')
                + '<br/>Owner is: ' + targetAppInfo[0].owner.userDirectory + '\\' + targetAppInfo[0].owner.userId,
                'Ok', 'Cancel'
            );
            document.getElementById('msgok_' + ownId).addEventListener("click", async function (f) {
                $("#msgparent_" + ownId).remove();


                $('#btn2_' + ownId).text('Replacing...').prop('disabled', true);
                var globalEnigma = global.session.__enigmaGlobal;
                //console.log('globalEnigma', globalEnigma);
                //var session = global.session;
                //console.log('session', session);
                try { /*
                    if (layout.pCBkeepData) {
                        // 1) copy SourceApp as CopiedApp
                        $('#btn2_' + ownId).html(progressBar(1 / 7));
                        var copiedAppInfo = await doAjax('POST', '/' + layout.vproxy + '/qrs/app/' + app.id + '/copy', ownId, httpHeader);
                        console.log('1)copiedAppInfo', copiedAppInfo);
                        if (copiedAppInfo == undefined) return;

                        // 2) get handle on target app
                        //console.log('getActiveDoc', await globalEnigma.getActiveDoc());
                        $('#btn2_' + ownId).html(progressBar(2 / 7));
                        var targetApp = await globalEnigma.openDoc(layout.pTargetAppId); //, NaN, NaN, NaN, true); // true = noData 
                        console.log('2)targetApp', targetApp);

                        // 3) get target app's script
                        var targetAppScript = await targetApp.getScript();
                        console.log('3)targetAppScript', targetAppScript);

                        // 4) get local app's script
                        $('#btn2_' + ownId).html(progressBar(3 / 7));
                        //var sourceAppScript = await localEnigma.getScript();
                        var sourceAppScript = await app.getScript();
                        console.log('4)sourceAppScript', sourceAppScript);

                        // 5) change local app's script to BINARY
                        //var setScript1 = await localEnigma.setScript('BINARY [lib://' + layout.pDataConn + '/' + layout.pTargetAppId + '];');
                        var setScript1 = await app.setScript('BINARY [lib://' + layout.pDataConn + '/' + layout.pTargetAppId + '];');
                        console.log('5) setScript1', setScript1);

                        // 6) reload local app with the data of the target app
                        $('#btn2_' + ownId).html(progressBar(4 / 7));
                        //var reloaded1 = await localEnigma.doReload(0, false);  // false = no Partial Reload (normal full reload)
                        var reloaded1 = await app.doReload(); //0, false);  // false = no Partial Reload (normal full reload)
                        console.log('6)reloaded1', reloaded1);
                        await app.doSave();

                        // 7) change local app's script to the target app's script
                        //var setScript2 = await localEnigma.setScript(targetAppScript);
                        var setScript2 = await app.setScript(targetAppScript);
                        console.log('7) setScript2', setScript2);

                        // 8) replace target app with source app
                        $('#btn2_' + ownId).html(progressBar(5 / 7));
                        var targetAppInfo = await doAjax('PUT', '/' + layout.vproxy + '/qrs/app/' + app.id + '/replace?app=' + layout.pTargetAppId, ownId, httpHeader);
                        console.log('8) targetAppInfo', targetAppInfo);

                        // 9) change local app's script to BINARY
                        $('#btn2_' + ownId).html(progressBar(6 / 7));
                        //var setScript3 = await localEnigma.setScript('BINARY [lib://' + layout.pDataConn + '/' + copiedAppInfo.id + '];');
                        var setScript3 = await app.setScript('BINARY [lib://' + layout.pDataConn + '/' + copiedAppInfo.id + '];');
                        console.log('9) setScript3', setScript3);

                        // 10) reload local app with the BINARY content of its copy
                        //var reloaded2 = await localEnigma.doReload(0, false);  // false = no Partial Reload (normal full reload)
                        var reloaded2 = await app.doReload(); // 0, false);  // false = no Partial Reload (normal full reload)
                        console.log('10) reloaded2', reloaded2);
                        await app.doSave();

                        // 11) revert local app's script to the original script;
                        //var setScript4 = await localEnigma.setScript(sourceAppScript);
                        var setScript4 = await app.setScript(sourceAppScript.qScript);
                        console.log('11) setScript4', setScript4);

                        // 12) delete the temp copy app
                        $('#btn2_' + ownId).html(progressBar(7 / 7));
                        var resDelete = await doAjax('DELETE', '/' + layout.vproxy + '/qrs/app/' + copiedAppInfo.id, ownId, httpHeader);
                        console.log('12) resDelete', resDelete);

                        $('#btn2_' + ownId).text('Done!');
                        setTimeout(function () {
                            $('#btn2_' + ownId).html(btnBefore).prop('disabled', '');
                        }, 1500);

                    } else { */
                        // 8) replace target app with source app
                        var targetAppInfo = await doAjax('PUT', '/' + layout.vproxy + '/qrs/app/' + app.id + '/replace?app=' + layout.pTargetAppId, ownId, httpHeader);
                        console.log('targetAppInfo', targetAppInfo);
                        $('#btn2_' + ownId).text('Done!');
                        setTimeout(function () {
                            $('#btn2_' + ownId).html(btnBefore).prop('disabled', '');
                        }, 1500);
                    //}

                } catch (error) {
                    leonardoMsg(ownId, 'Error', JSON.stringify(error), null, 'Close', true);
                }
            });

        },

        //=============================================================================================
        btnClick3: async function ($, ownId, app, layout) {
            //=========================================================================================
            var btnBefore = $('#btn3_' + ownId).html();
            $('#btn3_' + ownId).text('Saving...').prop('disabled', true);
            var objId;
            try {
                var httpHeader = {};
                httpHeader[layout.hdrkey] = layout.hdrval;
                const enigma = app.model.enigmaModel;

                const list = []
                //const app = qlik.currApp(this);
                console.log('Source Object(s)', layout.pSourceObjectIds)
                const objects = layout.pSourceObjectIds.split(',')

                for (let i = 0; i <= objects.length - 1; i++) {
                    objId = objects[i].trim();
                    const object = await app.getObject('', objId, null);
                    const objProps = await object.getProperties();
                    console.log('obj ' + objId + ' properties:', objProps);
                    // minimum entries in the 
                    var streamObj = {
                        id: objId,
                        type: objProps.visualization
                    };

                    if (objProps.visualization == 'kpi') {

                        for (let n = 0; n <= objProps.qHyperCubeDef.qMeasures.length - 1; n++) {
                            var measureProp = objProps.qHyperCubeDef.qMeasures[n];
                            var formula, label;
                            if (measureProp.qLibraryId == '') {
                                formula = measureProp.qDef.qDef;
                                label = measureProp.qDef.qLabelExpression || measureProp.qDef.qLabel;
                            } else {
                                // measure is a linked measure from Master Library, get the definition with separate enigma calls
                                const masterMeasureHandle = await enigma.getMeasure(measureProp.qLibraryId);
                                const masterMeasureProp = await masterMeasureHandle.getProperties();
                                formula = masterMeasureProp.qMeasure.qDef;
                                label = masterMeasureProp.qMeasure.qLabelExpression || masterMeasureProp.qMeasure.qLabel;
                            }
                            //console.log(n+' formula:', formula);
                            //lconsole.log(n+' label:', label);
                            if (n == 0) {
                                streamObj.kpiExpression = formula;
                                streamObj.titleExpression = label;
                            }
                            if (n == 1) streamObj.trendExpression = formula;
                        }


                        //streamObj.titleExpression = objProps.qHyperCubeDef.qMeasures[0].qDef.qLabelExpression || objProps.qHyperCubeDef.qMeasures[0].qDef.qLabel;
                        //if (objProps.qHyperCubeDef.qMeasures[1]) streamObj.trendExpression = objProps.qHyperCubeDef.qMeasures[1].qDef.qDef;
                        if (objProps.qHyperCubeDef.qCalcCond && objProps.qHyperCubeDef.qCalcCond.qv.length > 0) streamObj.calcExpression = objProps.qHyperCubeDef.qCalcCond.qv;

                    } else if (objProps.visualization == 'listbox') {
                        streamObj.listExpression = objProps.qListObjectDef.qDef.qFieldDefs[0];
                        if (objProps.title.qStringExpression) {
                            leonardoMsg(ownId, 'Warning',
                                'Title in listbox ' + streamObj.id + ' is a formula "' + objProps.title.qStringExpression.qExpr + '". Please put simple field name only!'
                                , null, 'Close', false);
                        } else {
                            streamObj.field = objProps.title;
                        }
                    }
                    if (objProps.footnote && objProps.footnote.qStringExpression) streamObj.subTitleExpression = objProps.footnote.qStringExpression.qExpr;
                    list.push(streamObj)
                }
                console.log('Kpi list', list);

                const res1 = await doAjax('POST', '/' + layout.vproxy + "/qrs/extension/" + layout.pExtension
                    + "/uploadfile?externalpath=" + layout.pFilename + "&overwrite=true", ownId, httpHeader, JSON.stringify(list));

                leonardoMsg(ownId, 'Success',
                    'Saved to <a href="../extensions/' + layout.pExtension + '/' + layout.pFilename + '" target="_blank">' + layout.pExtension + '/' + layout.pFilename + "</a>"
                    , null, 'Close', false);

            } catch (error) {

                leonardoMsg(ownId, 'Error ' + objId, JSON.stringify(error), null, 'Close', true);

            } finally {

                $('#btn3_' + ownId).html(btnBefore).prop('disabled', false);
            }
        },

        //=============================================================================================
        btnClick4: async function ($, ownId, app, layout) {
            //=========================================================================================
            var btnBefore = $('#btn4_' + ownId).html();
            $('#btn4_' + ownId).text('Exporting...').prop('disabled', true);

            try {

                var httpHeader = {};
                httpHeader[layout.hdrkey] = layout.hdrval;

                var copiedAppInfo = await doAjax('POST', '/' + layout.vproxy + '/qrs/app/' + app.id + '/copy', ownId, httpHeader);
                console.log(copiedAppInfo.id);

                var foundSheets = await doAjax('GET', '/' + layout.vproxy + '/qrs/app/object?filter=app.id eq ' + copiedAppInfo.id + " and objectType eq 'sheet'", ownId, httpHeader);

                var desiredSheets = [];
                // create an array of desiredSheets as per the Extension properties
                layout.listItems.forEach(function (s) {
                    desiredSheets.push(s.label.split('\n')[1]);
                });
                console.log('desiredSheets', desiredSheets);
                foundSheets.forEach(async function (sheet) {
                    //console.log('sheetID', sheetId);
                    if ((layout.pCPinclude && !desiredSheets.includes(sheet.engineObjectId))
                        || (!layout.pCPinclude && desiredSheets.includes(sheet.engineObjectId))) {
                        console.log('remove sheet ' + sheet.engineObjectId + ' in app copy.')
                        await doAjax('DELETE', '/' + layout.vproxy + '/qrs/app/object/' + sheet.id, ownId, httpHeader);
                    }
                });

                foundSheets = await doAjax('GET', '/' + layout.vproxy + '/qrs/app/object?filter=app.id eq ' + copiedAppInfo.id + " and objectType eq 'sheet'", ownId, httpHeader);
                console.log('Finally, this is the sheets list:', foundSheets);

                const guid = ('').concat(
                    Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1),
                    Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1), '-',
                    Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1), '-',
                    Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1), '-',
                    Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1), '-',
                    Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1),
                    Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1),
                    Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
                );
                var res1 = await doAjax('POST', '/' + layout.vproxy + '/qrs/app/' + copiedAppInfo.id + '/export/'
                    + guid + (layout.pWithData ? '' : '?skipData=true'), ownId, httpHeader);

                const filename = res1.downloadPath.split('/')[3].split('?')[0];

                doAjax('DELETE', '/' + layout.vproxy + '/qrs/app/' + copiedAppInfo.id, ownId, httpHeader);

                // making GET request with a request-http-header then compute a blob-download link

                var xhr = new XMLHttpRequest();
                xhr.withCredentials = true;

                xhr.addEventListener("readystatechange", function () {
                    if (this.readyState === 4) {
                        //console.log('GET response:', this);

                        var type = xhr.getResponseHeader('Content-Type');
                        var blob = new Blob([this.response], { type: type });
                        if (typeof window.navigator.msSaveBlob !== 'undefined') {
                            // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                            window.navigator.msSaveBlob(blob, filename);
                        } else {
                            var URL = window.URL || window.webkitURL;
                            var downloadUrl = URL.createObjectURL(blob);

                            if (filename) {
                                // use HTML5 a[download] attribute to specify filename
                                var a = document.createElement("a");
                                // safari doesn't support this yet
                                if (typeof a.download === 'undefined') {
                                    window.location = downloadUrl;
                                } else {
                                    a.href = downloadUrl;
                                    a.download = filename;
                                    document.body.appendChild(a);
                                    a.click();
                                }
                            } else {
                                window.location = downloadUrl;
                            }

                            setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
                        }
                    }
                });
                xhr.responseType = 'blob';
                xhr.open("get", "/" + layout.vproxy + res1.downloadPath);
                xhr.setRequestHeader(layout.hdrkey, layout.hdrval);
                xhr.send();


                setTimeout(function () {
                    $('#btn4_' + ownId).html(btnBefore).prop('disabled', false);
                }, 2000);
            } catch (error) {
                leonardoMsg(ownId, 'Error', JSON.stringify(error), null, 'Close', true);
            }
        }
    };
});