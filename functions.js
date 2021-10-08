// functions needed in DevelopersFriend.js ...

define([], function () {

    //=============================================================================================
    function leonardoMsg(ownId, title, detail, ok, cancel, inverse) {
        //=========================================================================================
        // This html was found on https://qlik-oss.github.io/leonardo-ui/dialog.html
        if ($('#msgparent_' + ownId).length > 0) $('#msgparent_' + ownId).remove();

        var html = '<div id="msgparent_' + ownId + '">' +
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
                '   onclick="$(\'#msgparent_' + ownId + '\').remove();">' +
                //'   onclick="var elem=document.getElementById(\'msgparent_' + ownId + '\');elem.parentNode.removeChild(elem);">' +
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
            '  </div>' +
            '</div>';

        $("#qs-page-container").append(html);
        // fix for Qlik Sense > July 2021, the dialog gets rendered below the visible part of the screen
        if ($('#msgparent_' + ownId + ' .lui-dialog').position().top > 81) {
            $('#msgparent_' + ownId + ' .lui-dialog').css({
                'top': (-$('#msgparent_' + ownId + ' .lui-dialog').position().top + 100) + 'px'
            });
        }
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
            return result || ''; // return empty string instead of undefined
        } catch (error) {
            leonardoMsg(ownId, 'Error', error.status + ' ' + error.responseText, null, 'Close', true);
            console.log('error', error.status + ' ' + error.responseText);
            return ({ "error": true, "info": error });
        }
    }

    return {

        // nice messagebox using Leonardo UI style by Qlik 	
        leonardoMsg: function (ownId, title, detail, ok, cancel, inverse) {
            leonardoMsg(ownId, title, detail, ok, cancel, inverse);
        },

        //=============================================================================================
        btnClick1: async function ($, ownId, app, layout, vproxy, httpHeader) {
            //=========================================================================================
            // Reload Button clicked
            var btnBefore = $('#btn1_' + ownId).html();
            $('#btn1_' + ownId).prop('disabled', true)
                .html('<span id="' + ownId + '_rldstat"><span class="lui-icon  lui-icon--reload developersFriend-rotate"></span> ...</span>');
            try {

                var timer;
                var watchThisTask;
                // text codes for the statuses
                var statusList = [
                    '0', '1',
                    '<span class="lui-icon  lui-icon--reload developersFriend-rotate"></span> Running',
                    '3', '4', '5', '6',
                    '<span class="lui-icon  lui-icon--tick"></span> Finished',
                    '<span class="lui-icon  lui-icon--warning"></span> Failed'
                ];

                function checkTaskProgress(watchThisTask, startTimer) {
                    var timeSince = Math.round((Date.now() - startTimer) / 1000);
                    timeSince = (timeSince > 59 ? Math.floor(timeSince / 60) : 0) + ':' + ('0' + (timeSince % 60)).slice(-2);
                    //$('#' + ownId + '_rldstat').text('getting warm');
                    doAjax('GET', vproxy + "/qrs/reloadtask/" + watchThisTask, ownId, httpHeader)
                        .then(function (task) {
                            if (task.operational && task.operational.lastExecutionResult) {
                                var status = task.operational.lastExecutionResult.status;
                                if (statusList[status]) status = statusList[status];
                                $('#' + ownId + '_rldstat').html(status + ' (' + timeSince + ')');
                                if (task.operational.lastExecutionResult.duration > 0) {
                                    clearInterval(timer);
                                    console.log('Reload Task finished.');
                                    $('#btn1_' + ownId).prop('disabled', false);
                                }
                            }
                        });
                }

                if (layout.pReloadOwn == true || layout.pReloadOwn == undefined) {

                    // reload button should trigger reload of the current app
                    await doAjax('POST', vproxy + '/qrs/app/' + app.id + '/reload', ownId, httpHeader);

                    // get list of "Manually" tasks for this app
                    var tasks = await doAjax('GET', vproxy +
                        "/qrs/reloadtask?filter=name sw 'Manually' and app.id eq " + app.id
                        , ownId, httpHeader);
                    //var startTimer = Date.now();
                    if (tasks.length == 1) {
                        watchThisTask = tasks[0].id;
                        timer = setInterval(checkTaskProgress, 3000, watchThisTask, Date.now());
                    } else if (tasks.length > 1) {
                        $('#' + ownId + '_rldstat').text('Cannot check status.');
                    } else {
                        $('#btn1_' + ownId).html(btnBefore);
                        $('#btn1_' + ownId).html(btnBefore).prop('disabled', '');
                    }

                } else {

                    // reload button should trigger a specific task (even when not for the current app)
                    watchThisTask = layout.pTaskId;
                    var taskStart = await doAjax('POST', vproxy + '/qrs/task/start/many', ownId, httpHeader, '["' + layout.pTaskId + '"]');
                    console.log('taskStart', taskStart);
                    if (!taskStart.error) {
                        timer = setInterval(checkTaskProgress, 3000, watchThisTask, Date.now());
                    } else {
                        $('#btn1_' + ownId).html(btnBefore);
                        $('#btn1_' + ownId).html(btnBefore).prop('disabled', '');
                    }
                }

            } catch (error) {
                leonardoMsg(ownId, 'Error 145', error, null, 'Close', true);
            }
        },

        //=============================================================================================
        btnClick2: async function ($, ownId, app, layout, vproxy, httpHeader, databridgeHubUrl) { //, global) {
            //=========================================================================================
            // Replace App Button clicked
            var btnBefore = $('#btn2_' + ownId).html();
            // var httpHeader = {};
            // httpHeader[layout.hdrkey] = layout.hdrval;

            if (layout.pUseDBHub) {
                window.open(databridgeHubUrl + '?app=' + layout.pTargetAppId + '&from=' + app.id
                    + (layout.pCopyDesign ? '&importdesign' : '') + (layout.pCopyScript ? '&importscript' : '')
                    + (layout.pCopyData ? '&importdata' : ''));
            } else {
                var targetAppInfo = await doAjax('GET', vproxy + '/qrs/app/full?filter=id%20eq%20' + layout.pTargetAppId, ownId, httpHeader)
                //console.log('targetAppInfo', targetAppInfo);
                if (targetAppInfo.length == 0) {
                    return leonardoMsg(ownId, 'Error', 'Invalid target app id.', null, 'Close', true);
                }
                leonardoMsg(ownId, 'Confirm app replacement',
                    'Really want to replace design of app <a href="' + location.href.split('/app')[0] + '/app/' + layout.pTargetAppId
                    + '" target="_blank">' + targetAppInfo[0].name + '</a>?<br/>'
                    + (targetAppInfo[0].stream ? ('The app is published in stream "' + targetAppInfo[0].stream.name + '"') : 'The app is not published.')
                    + '<br/>Owner is: ' + targetAppInfo[0].owner.userDirectory + '\\' + targetAppInfo[0].owner.userId,
                    'Ok', 'Cancel'
                );
                document.getElementById('msgok_' + ownId).addEventListener("click", async function (f) {
                    $("#msgparent_" + ownId).remove();


                    $('#btn2_' + ownId).text('Replacing...').prop('disabled', true);
                    try {
                        var targetAppInfo = await doAjax('PUT', vproxy + '/qrs/app/' + app.id + '/replace?app=' + layout.pTargetAppId, ownId, httpHeader);
                        console.log('targetAppInfo', targetAppInfo);
                        $('#btn2_' + ownId).text('Done!');
                        setTimeout(function () {
                            $('#btn2_' + ownId).html(btnBefore).prop('disabled', '');
                        }, 1500);

                    } catch (error) {
                        leonardoMsg(ownId, 'Error', JSON.stringify(error), null, 'Close', true);
                    }
                });
            }
        },

        //=============================================================================================
        btnClick3: async function ($, ownId, app, layout, vproxy, httpHeader) {
            //=========================================================================================
            var btnBefore = $('#btn3_' + ownId).html();
            $('#btn3_' + ownId).text('Saving...').prop('disabled', true);
            var objId;
            try {
                // var httpHeader = {};
                // httpHeader[layout.hdrkey] = layout.hdrval;
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
                        if (objProps.qHyperCubeDef.qCalcCond && objProps.qHyperCubeDef.qCalcCond.qv.length > 0)
                            streamObj.calcExpression = objProps.qHyperCubeDef.qCalcCond.qv;

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
                    if (objProps.footnote && objProps.footnote.qStringExpression)
                        streamObj.subTitleExpression = objProps.footnote.qStringExpression.qExpr;

                    list.push(streamObj)
                }
                console.log('Kpi list', list);

                const res1 = await doAjax('POST', vproxy + "/qrs/extension/" + layout.pExtension
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
        btnClick4: async function ($, ownId, app, layout, vproxy, httpHeader) {
            //=========================================================================================
            var btnBefore = $('#btn4_' + ownId).html();
            $('#btn4_' + ownId).text('Exporting...').prop('disabled', true);

            try {

                // var httpHeader = {};
                // httpHeader[layout.hdrkey] = layout.hdrval;

                var copiedAppInfo = await doAjax('POST', vproxy + '/qrs/app/' + app.id + '/copy', ownId, httpHeader);
                console.log(copiedAppInfo.id);

                var foundSheets = await doAjax('GET', vproxy + '/qrs/app/object?filter=app.id eq ' + copiedAppInfo.id + " and objectType eq 'sheet'", ownId, httpHeader);

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
                        await doAjax('DELETE', vproxy + '/qrs/app/object/' + sheet.id, ownId, httpHeader);
                    }
                });

                foundSheets = await doAjax('GET', vproxy + '/qrs/app/object?filter=app.id eq ' + copiedAppInfo.id + " and objectType eq 'sheet'", ownId, httpHeader);
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
                var res1 = await doAjax('POST', vproxy + '/qrs/app/' + copiedAppInfo.id + '/export/'
                    + guid + (layout.pWithData ? '' : '?skipData=true'), ownId, httpHeader);

                const filename = res1.downloadPath.split('/')[3].split('?')[0];

                doAjax('DELETE', vproxy + '/qrs/app/' + copiedAppInfo.id, ownId, httpHeader);

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
        },

        //=============================================================================================
        btnClick5: async function ($, ownId, app, layout, vproxy, httpHeader) {
            //=========================================================================================
            console.log(layout);
            var btnBefore = $('#btn5_' + ownId).html();
            $('#btn5_' + ownId).text('Saving...').prop('disabled', true);
            var objId;
            var args = {
                timeout: 0,
                method: 'GET',
                url: '../extensions/developersfriend/',
                headers: httpHeader
            };
            var settingsTxt;
            const libOrExt1 = 'extension';  // 'contentlibrary'
            const libOrExt2 = (libOrExt1 + 's').replace('library', '');
            const libOrExtName = layout.pMapExtension; //'mappings'
            const settingsFile = layout.pMapFilename; //'productnames.css';
            //const maxSelections = 50;
            const enigma = app.model.enigmaModel;
            var addUser = "";
            var keyFields = layout.pMapKeyVals.split('\n');
            var html = '';
            const settings = $.ajax({ type: 'GET', url: `../${libOrExt2}/${libOrExtName}/${settingsFile}`, async: false });
            if (settings.status != '200') {
                leonardoMsg(ownId, 'Error', `File ${settingsFile} doesn't exist in ${libOrExt1} ${libOrExtName}. Please <a 
				href="../dev-hub/extension-editor/#qext{${libOrExtName}}" target="_blank">create it first</a>.`, null, 'Close', false);
            } else if (layout.pMapCondition != -1) {
                leonardoMsg(ownId, 'Error', layout.pMapMessage, null, 'Close', false);
            } else {
                settingsTxt = settings.responseText;
                layout.pMapWriteFields.forEach(function (fieldSettings, i) {
                    html += html.length > 0 ? '<hr/>' : '';
                    html += `<label for=""i${i}${ownId}">${fieldSettings.label}</label><br/>`;
                    html += `<input type="text" id="i${i}${ownId}" list="vals${i}${ownId}" style="width:100%;" value="${fieldSettings.mapFieldDefault}"></input>`;
                    html += `<datalist id="vals${i}${ownId}">`;
                    fieldSettings.mapFieldOptions.split('\n').forEach(function (opt) {
                        html += `<option>${opt}</option>`;
                    });
                    html += `</datalist>`;
                });

                leonardoMsg(ownId, `Mapping for ${keyFields.length} keys
				<span class="lui-icon  lui-icon--info" title="${layout.pMapKeyVals}"></span>`, html, 'OK', 'Close', false);

                $('#msgok_' + ownId).on("click", async function () {
                    var newLines = ''
                    var newVals = '';
                    if (layout.pMapAddUsername) {
                        addUser = await enigma.evaluate("',' & TextBetween(OSUser(),'Directory=',';') & '\\' & SubField(OSUser(),'UserId=',2) & ',' & TimeStamp(Now(),'YYYYMMDD hhmmss')");
                    }
                    layout.pMapWriteFields.forEach(function (fieldSettings, i) {
                        newVals += ',"' + $('#i' + i + ownId).val().replace(/"/g, '""') + '"';
                    });
                    newVals += addUser;

                    // Add new lines to the settings-file

                    layout.pMapKeyVals.split('\n').forEach(function (keyVal, i) {
                        newLines += '\n"' + keyVal.replace(/"/g, '""') + '"' + (i >= 1 && layout.pSaveSpace ? (',¶' + (layout.pMapAddUsername ? ',¶,¶' : '')) : newVals);
                    });

                    const res1 = await doAjax('POST', `${vproxy}/qrs/${libOrExt1}/${libOrExtName}/uploadfile`
                        + `?externalpath=${settingsFile}&overwrite=true`, ownId, httpHeader, settingsTxt + newLines);

                    leonardoMsg(ownId, 'Success', `Saved to <a href="../${libOrExt2}/${libOrExtName}/${settingsFile}" target="_blank">${res1}</a>
					    <br/><br/><p style="overflow-y:scroll;height:250px;width:800px;">${newLines.replace(/\n/g, '<br/>')}</p>`
                        , null, 'Close', false);
                });
            }
            $('#btn5_' + ownId).html(btnBefore).prop('disabled', false);
        }
    };
});
