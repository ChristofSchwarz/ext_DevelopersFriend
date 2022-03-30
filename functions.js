// functions needed in DevelopersFriend.js ...

define([], function () {

    //=============================================================================================
    function leonardoMsg(ownId, title, detail, ok, cancel, stayOpen, inverse) {
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
                '  <button class="lui-button  lui-dialog__button' + (inverse ? '  lui-button--inverse' : '') + '" id="msgcancel_' + ownId + '"' +
                (!stayOpen ? ' onclick="$(\'#msgparent_' + ownId + '\').remove();"' : '') + '>' +
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

        if ($("#qs-page-container").length > 0) {
			$("#qs-page-container").append(html);  // one of the two css selectors will work
		} else {
        	$("#qv-stage-container").append(html);  // above in Sense Client, below in /single mode
		}
        // fix for Qlik Sense > July 2021, the dialog gets rendered below the visible part of the screen
        if ($('#msgparent_' + ownId + ' .lui-dialog').position().top > 81) {
            $('#msgparent_' + ownId + ' .lui-dialog').css({
                'top': (-$('#msgparent_' + ownId + ' .lui-dialog').position().top + 100) + 'px'
            });
        }
    }

    //=============================================================================================
    function showiframe(ownId, title, source, cancel) {
        //=========================================================================================
        // This html was found on https://qlik-oss.github.io/leonardo-ui/dialog.html
        if ($('#msgparent_' + ownId).length > 0) $('#msgparent_' + ownId).remove();

        var html = '<div id="msgparent_' + ownId + '">' +
            '  <div class="lui-modal-background"></div>' +
            '  <div class="lui-dialog" style="width: 400px;top:80px;">' +
            '    <div class="lui-dialog__header">' +
            '      <div class="lui-dialog__title">' + title + '</div>' +
            '    </div>' +
            '    <div class="lui-dialog__body" style="padding:0;">' +
            '       <iframe src="' + source + '" style="width:99%;height:99%;"></iframe>' +
            '    </div>' +
            '    <div class="lui-dialog__footer">';
        if (cancel) {
            html +=
                '  <button class="lui-button  lui-dialog__button" id="msgcancel_' + ownId + '"' +
                ' onclick="$(\'#msgparent_' + ownId + '\').remove();">' + cancel +
                ' </button>'
        }
        html +=
            '     </div>' +
            '  </div>' +
            '</div>';

        $("#qs-page-container").append(html);  
        //$("#qv-page-container").append(html);  // in /single mode

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
            leonardoMsg(ownId, 'Error', error.status + ' ' + error.responseText, null, 'Close', false, true);
            console.log('error', error.status + ' ' + error.responseText);
            return ({ "error": true, "info": error });
        }
    }



	function createTree(paths, separator) {
		return paths.reduce((obj, path) => {
			path.split(separator).reduce((acc, component) => { 
				return acc[component] = acc[component] || {};
			}, obj);
			return obj;  
		}, {});
	}

	function handleChange(L, id, paths, tree, splitAt, okId) {
		var ret = '';
		$('#' + id + '_' + L + ' [value=""]').remove();
		const L1 = $('#' + id + '_1').find(":selected").text();	
		if (L<=1) $('#' + id + '_2').empty().hide();
		const L2 = $('#' + id + '_2').find(":selected").text();
		if (L<=2) $('#' + id + '_3').empty().hide();
		const L3 = $('#' + id + '_3').find(":selected").text();	
		if (L<=3) $('#' + id + '_4').empty().hide();
		var treePart = false;
		switch (L) {
		  case 1:
			treePart = tree[L1];
			break;
		  case 2:
			treePart = tree[L1][L2];
			break;	  
		  case 3:
			treePart = tree[L1][L2][L3];
			break;	  
		  case 4:
			break;
		}
		if (treePart && !$.isEmptyObject(treePart)) {
			$('#' + id + '_' + (L+1)).append('<option value="" disabled selected>--choose--</option>').show();
			for (var key in treePart) {
				$('#' + id + '_' + (L+1)).append('<option value="'+key+'">' + key + '</option>');
			}
		}

		if ($('#' + id + '_1').val()) ret += $('#' + id + '_1').find(":selected").text();
		if ($('#' + id + '_2').val()) ret += splitAt + $('#' + id + '_2').find(":selected").text();
		if ($('#' + id + '_3').val()) ret += splitAt + $('#' + id + '_3').find(":selected").text();	
		if ($('#' + id + '_4').val()) ret += splitAt + $('#' + id + '_4').find(":selected").text();
		const valid = paths.indexOf(ret) > -1;
		$('#' + id).val(ret);
		if (valid) {
			$('#' + okId).prop('disabled', false); // enable OK button
			$('#' + id).css('background-color', '');
		} else {
			$('#' + okId).prop('disabled', true); // disable OK button
			$('#' + id).css('background-color', 'lightpink')
		}
	//	console.log(ret, valid);
	}

    return {

        // nice messagebox using Leonardo UI style by Qlik 	
        leonardoMsg: function (ownId, title, detail, ok, cancel, stayopen, inverse) {
            leonardoMsg(ownId, title, detail, ok, cancel, stayopen, inverse);
        },
        showiframe: function (ownId, title, source, cancel) {
            showiframe(ownId, title, source, cancel);
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
                    '0', '<span class="lui-icon  lui-icon--history"></span> Queued',
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
                leonardoMsg(ownId, 'Error 145', error, null, 'Close');
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
                    return leonardoMsg(ownId, 'Error', 'Invalid target app id.', null, 'Close');
                }
                leonardoMsg(ownId, 'Confirm app replacement',
                    'Really want to replace design of app <a href="' + location.href.split('/app')[0] + '/app/' + layout.pTargetAppId
                    + '" target="_blank">' + targetAppInfo[0].name + '</a>?<br/>'
                    + (targetAppInfo[0].stream ? ('The app is published in stream "' + targetAppInfo[0].stream.name + '"') : 'The app is not published.')
                    + '<br/>Owner is: ' + targetAppInfo[0].owner.userDirectory + '\\' + targetAppInfo[0].owner.userId
					+ '<br/><br/><label class="lui-checkbox">'
					+ '  <input class="lui-checkbox__input" type="checkbox" aria-label="Label" id="' + ownId + '_reloadAfter" />'
                    + '  <div class="lui-checkbox__check-wrap"><span class="lui-checkbox__check"></span>'
					+ '  <span class="lui-checkbox__check-text">Trigger reload of target app after refresh.</span></div>'
					+ '</label>',
                    'Ok', 'Cancel'
                );
                document.getElementById('msgok_' + ownId).addEventListener("click", async function (f) {
                    const reloadAfter = $('#' + ownId + '_reloadAfter').is(':checked');
                    $("#msgparent_" + ownId).remove();
                    $('#btn2_' + ownId).text('Replacing...').prop('disabled', true);
                    try {
                        const targetAppInfo = await doAjax('PUT', vproxy + '/qrs/app/' + app.id + '/replace?app=' + layout.pTargetAppId, ownId, httpHeader);
						if (reloadAfter) await doAjax('POST', vproxy + '/qrs/app/' + layout.pTargetAppId + '/reload', ownId, httpHeader);
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
                                , null, 'Close');
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
                    , null, 'Close');

            } catch (error) {

                leonardoMsg(ownId, 'Error ' + objId, JSON.stringify(error), null, 'Close');

            } finally {

                $('#btn3_' + ownId).html(btnBefore).prop('disabled', false);
            }
        },

        //========================== EXPORT APP BUTTON   ========================
        btnClick4: async function ($, ownId, app, layout, vproxy, httpHeader) {
            //===================================================================

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
                leonardoMsg(ownId, 'Error', JSON.stringify(error), null, 'Close');
            }
        },

        //=============================== SAVE MAPPINGS BUTTON ========================
        btnClick5: async function ($, ownId, app, layout, vproxy, httpHeader) {
            //=========================================================================
            console.log(layout);
            var btnBefore = $('#btn5_' + ownId).html();
            $('#btn5_' + ownId).prop('disabled', true).html('<img src="../extensions/DevelopersFriend/pics/giphy.gif" width="28">');
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
            var keyFields = await enigma.evaluate(layout.pMapKeyVals); // <- new Dec 2021: evaluate the formula now
            keyFields = keyFields.split('\n');
            var html = '';
            const settings = $.ajax({ type: 'GET', url: `../${libOrExt2}/${libOrExtName}/${settingsFile}`, async: false });
            if (settings.status != '200') {
                leonardoMsg(ownId, 'Error', `File ${settingsFile} doesn't exist in ${libOrExt1} ${libOrExtName}. Please <a 
				href="../dev-hub/extension-editor/#qext{${libOrExtName}}" target="_blank">create it first</a>.`, null, 'Close');
            } else if (layout.pMapCondition == 0) {
                leonardoMsg(ownId, 'Error', layout.pMapMessage, null, 'Close');
            } else {
                settingsTxt = settings.responseText;
                leonardoMsg(ownId, `Mapping for ${keyFields.length} keys
				<span class="lui-icon  lui-icon--info" title="${keyFields}"></span>`, html, 'OK', 'Close');
				$('#msgparent_' + ownId + ' .lui-dialog').css('width', '700px');
                layout.pMapWriteFields.forEach(function (fieldSettings, i) {
                    enigma.evaluate(fieldSettings.mapFieldOptions)  // <- new Dec 2021: evaluate the formula now
                        .then(function (options) {
							var paths = options.split('\n');
                            var html2 = '';
							const splitAt = fieldSettings.mapFieldSplitChar;
							const tree = splitAt ? createTree(paths, splitAt) : null;
							const id = 'i' + i + ownId;
                            html2 += '<div class="showhide">';
                            html2 += `<label for=""${id}">${fieldSettings.label}</label><br/>`;
                            html2 += `<input type="text" id="${id}" list="vals_${id}" class="lui-input" style="width:100%;margin-bottom:10px;" 
							    value="${fieldSettings.mapFieldDefault}" ${splitAt ? 'disabled' : ''}></input>`;
							if (splitAt) {
								
								console.log(tree);
								html2 += `<select id="${id}_1"><option value="" disabled selected>--choose--</option>`; 
								// show and fill the first level dropdown
								for (var L1 in tree) {
									html2 += `<option value="${L1}">${L1}</option>`;
								}
								html2 += `</select>`;
								html2 += `<select id="${id}_2" style="display:none;"></select>`;
								html2 += `<select id="${id}_3" style="display:none;"></select>`;
								html2 += `<select id="${id}_4" style="display:none;"></select>`;
								
								
							} else {
								// add available options from list
								html2 += `<datalist id="vals_${id}">`;
								paths.forEach(function (opt) {
									html2 += `<option>${opt}</option>`;
								}); 
							}
                            html2 += `</datalist>`;
							
							html2 += `</div>
							<div class="developersFriend-spinner  hideshow" style="display:none;"></div>`;
                            $(`#msgparent_${ownId} .lui-dialog__body`).append(html2);
							
							if (splitAt) {
								$('#' + id + '_1').on('change', function(){ 
									handleChange(1,id,paths,tree,splitAt, 'msgok_'+ownId); 
								});
								$('#' + id + '_2').on('change', function(){ 
									handleChange(2,id,paths,tree,splitAt, 'msgok_'+ownId); 
								});
								$('#' + id + '_3').on('change', function(){ 
									handleChange(3,id,paths,tree,splitAt,'msgok_'+ownId); 
								});
								$('#' + id + '_4').on('change', function(){ 
									handleChange(4,id,paths,tree,splitAt,'msgok_'+ownId); 
								});

								fieldSettings.mapFieldDefault.split(splitAt).forEach(function(defPart, i){
									$('#' + id + '_'+(i+1)).val(defPart);
									handleChange(i+1, id, paths, tree, splitAt);
								})
							}
                        });
                });


                $('#msgok_' + ownId).on("click", async function () {

                    //$('#msgparent_'+ownId+' .lui-dialog__footer button').prop('disabled',true); // disable buttons
                    $('#msgok_' + ownId).prop('disabled', true); // disable OK button (Cancel button is still active)

                    $('#msgparent_' + ownId + ' .showhide').hide();
                    $('#msgparent_' + ownId + ' .hideshow').show();
                    var newLines = ''
                    var newVals = '';
                    if (layout.pMapAddUsername) {
                        addUser = await enigma.evaluate("',' & SubField(OSUser(),'UserId=',2) & ',' & TimeStamp(Now(),'YYYYMMDD hhmmss')");
                        //addUser = await enigma.evaluate("',' & TextBetween(OSUser(),'Directory=',';') & '\\' & SubField(OSUser(),'UserId=',2) & ',' & TimeStamp(Now(),'YYYYMMDD hhmmss')");
                    }
                    layout.pMapWriteFields.forEach(function (fieldSettings, i) {
                        newVals += ',"' + $('#i' + i + ownId).val().replace(/"/g, '""') + '"';
                    });
                    newVals += addUser;

                    // Add new lines to the settings-file

                    keyFields.forEach(function (keyVal, i) {
                        newLines += '\n"' + keyVal.replace(/"/g, '""') + '"' + (i >= 1 && layout.pSaveSpace ? (',¶' + (layout.pMapAddUsername ? ',¶,¶' : '')) : newVals);
                    });

                    const res1 = await doAjax('POST', `${vproxy}/qrs/${libOrExt1}/${libOrExtName}/uploadfile`
                        + `?externalpath=${settingsFile}&overwrite=true`, ownId, httpHeader, settingsTxt + newLines);
                    if ($('#msgparent_' + ownId).length == 1) {

					///////////////77 Instant reload

                        /* if (layout.pInstantReload1) */ doAjax('POST', vproxy + '/qrs/app/' + app.id + '/reload', ownId, httpHeader);

                        leonardoMsg(ownId, 'Success', `Saved to <a href="../${libOrExt2}/${libOrExtName}/${settingsFile}" target="_blank">${res1}</a>
							<br/><br/><div style="overflow:auto;">
							    <p style="overflow-y:scroll;height:250px;width:800px;background-color:#e8e8e8;font-family:monospace;">${newLines.replace(/\n/g, '<br/>')}</p>
						    </div>`
                            , null, 'Close');
                    } else {
                        console.log(ownId, 'Success', `Saved file "${libOrExt2}/${libOrExtName}/${settingsFile}"`);
                    }
                    if (layout.pTriggerButton) $(`[tid="${layout.pTriggerButton}"] button`).trigger('click');
                    if (layout.pUseSetVariable) {
                        app.variable.setStringValue(layout.pSetThisVariable1, layout.pSetVariableValue1);
                    }
                });
            }
            $('#btn5_' + ownId).html(btnBefore).prop('disabled', false);
        },

        //============================ Delete Mappings Button ======================
        btnClick6: async function ($, ownId, app, layout, vproxy, httpHeader) {
            //======================================================================
            console.log(layout);
            var btnBefore = $('#btn6_' + ownId).html();
            $('#btn6_' + ownId).html('<img src="../extensions/DevelopersFriend/pics/giphy.gif" width="28">');
            $('#btn6_' + ownId).prop('disabled', true);


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
            const libOrExtName = layout.pDelExtension; //'mappings'
            const settingsFile = layout.pDelFilename; //'productnames.css';
            //const maxSelections = 50;
            const enigma = app.model.enigmaModel;
            //var addUser = "";
            var keyFields = await enigma.evaluate(layout.pDelKeyVals);  // <- new Dec 2021: evaluate the formula now
            keyFields = keyFields.replace(/"/g, '""').split('\n');
            console.log('keys that should be deleted', keyFields);

            const settings = $.ajax({ type: 'GET', url: `../${libOrExt2}/${libOrExtName}/${settingsFile}`, async: false });
            if (settings.status != '200') {
                leonardoMsg(ownId, 'Error', `File ${settingsFile} doesn't exist in ${libOrExt1} ${libOrExtName}.`, null, 'Close');
                $('#btn6_' + ownId).html(btnBefore).prop('disabled', false);
            } else if (layout.pDelCondition == 0) {
                leonardoMsg(ownId, 'Check failed', layout.pDelMessage, null, 'Close');
                $('#btn6_' + ownId).html(btnBefore).prop('disabled', false);
            } else {
                setTimeout(/* 300 */ function () { // give the browser a short moment to update DOM and show spinner GIF
                    settingsTxt = settings.responseText.split('\n');
                    //console.log('>>'+settingsTxt+'<<');
                    var rowsCountOrig = settingsTxt.length;
                    var html = (rowsCountOrig) + ' rows found in file "' + settingsFile + '".<br>';
                    var delCount = 0;

                    var delSettings = [];
                    var errors = 0;
                    var needle = 0;
                    for (var i = 0; i <= rowsCountOrig && errors == 0; i++) {
                        row = settingsTxt[needle];
                        var key = row.replace(/""/g, '«»');
                        // check if the count of double-quotes per line is a equal number (2, 4, 6 ...)
                        errors += (key.length - key.replace(/"/g, '').length) % 2;
                        key = (key.substr(0, 1) == '"' ? key.substr(1, key.indexOf('"', 1) - 1) : key.split(',')[0])
                            .replace(/«»/g, '""');
                        if (i == 0) {
                            // first row is header row
                            html += 'Key field is "' + key + '".<br>';
                        } else {

                            if (keyFields.indexOf(key) > -1) {
                                delCount++;
                                delSettings.push(row);
                                settingsTxt.splice(needle, 1);  // delete one array element in settingsTxt
                            } else {
                                if (errors == 0) needle++;
                            }

                        }
                    }

                    if (errors > 0) {
                        leonardoMsg(ownId, 'Error',
                            'There is a quotation error in the file "' + settingsFile + '". See browser log (F12).'
                            , null, 'Close');
                        console.error('Row ' + needle + ' has an open quote without closing quote.');
                        console.error(settingsTxt[needle]);
                        $('#btn6_' + ownId).html(btnBefore).prop('disabled', false);

                    } else if (delCount == 0) {
                        leonardoMsg(ownId, 'Please Check', html +
                            '<br>The ' + keyFields.length + ' key(s) you selected do(es) <strong>not exist in file "' + settingsFile + '"</strong>'
                            , null, 'Close', true);
                        $('#msgcancel_' + ownId).on("click", async function () {
                            $('#msgparent_' + ownId).remove();
                            $('#btn6_' + ownId).html(btnBefore).prop('disabled', false);
                        });

                    } else {
                        html += 'The following <strong>' + delCount + ' row(s)</strong> would be deleted:';
                        html += `<br/><br/><div style="overflow:auto;">
						    <p style="overflow-y:scroll;height:120px;width:1000px;background-color:#e8e8e8;font-family:monospace;">${delSettings.join('<br/>')}</p>
							</div>`;
                        html += '<br/>Proceed?'

                        leonardoMsg(ownId, `${keyFields.length} keys selected
					<span class="lui-icon  lui-icon--info" title="${layout.pDelKeyVals}"></span>`,
                            html, 'Yes, delete', 'Cancel', true);
						$('#msgparent_' + ownId + ' .lui-dialog').css('width', '700px');
                        $('#msgok_' + ownId).on("click", async function () {
                            // remove msgbox
                            $('#msgparent_' + ownId).remove();

                            const res1 = await doAjax('POST', `${vproxy}/qrs/${libOrExt1}/${libOrExtName}/uploadfile`
                                + `?externalpath=${settingsFile}&overwrite=true`, ownId, httpHeader, settingsTxt.join('\n'));

                            if (layout.pUseSetVariable2) {
                                app.variable.setStringValue(layout.pSetThisVariable2, layout.pSetVariableValue2);
                            }
							/* if (layout.pInstantReload1) */ doAjax('POST', vproxy + '/qrs/app/' + app.id + '/reload', ownId, httpHeader);

                            leonardoMsg(ownId, 'Success',
                                `Saved to <a href="../${libOrExt2}/${libOrExtName}/${settingsFile}" target="_blank">${res1}</a>`
                                , null, 'Close', false);
                            $('#btn6_' + ownId).html(btnBefore).prop('disabled', false);
                        });

                        $('#msgcancel_' + ownId).on("click", async function () {
                            $('#msgparent_' + ownId).remove();
                            $('#btn6_' + ownId).html(btnBefore).prop('disabled', false);
                        });
                    }
                }, 300);
            }
        }
    };
});
