// functions needed in DevelopersFriend.js ...

// Custom Properties
// https://help.qlik.com/en-US/sense-developer/November2020/Subsystems/Extensions/Content/Sense_Extensions/Howtos/custom-slider-properties.htm

// Changes:
// 31.08.2021 added "reload with specific task id" option

define(["./functions"], function (functions) {
    return {

        qrsSettings: function (qlik) {
            return {
                label: 'Access to QRS API',
                type: 'items',
                items: [{
                    type: "boolean",
                    component: "switch",
                    label: "Connect to QRS API",
                    ref: "pViaVproxy",
                    options: [{
                        value: true,
                        label: "via Virtual Proxy"
                    }, {
                        value: false,
                        label: "with my own rights"
                    }],
                    defaultValue: false
                }, {
                    label: "You need to have ContentAdmin or RootAdmin role.",
                    component: "text",
                    show: function (layout) { return !layout.pViaVproxy; }
                }, {
                    label: 'VirtualProxy',
                    type: 'string',
                    expression: 'optional',
                    ref: 'vproxy',
                    defaultValue: 'header',
                    show: function (layout) { return layout.pViaVproxy; }
                }, {
                    label: 'Header-key',
                    type: 'string',
                    expression: 'optional',
                    ref: 'hdrkey',
                    defaultValue: 'header',
                    show: function (layout) { return layout.pViaVproxy; }
                }, {
                    label: 'Header-value',
                    type: 'string',
                    expression: 'optional',
                    ref: 'hdrval',
                    defaultValue: 'extension-ReloadReplace',
                    show: function (layout) { return layout.pViaVproxy; }
                }, {
                    label: "Test settings ...",
                    component: "button",
                    action: async function (data) {
                        var app = qlik.currApp();
                        var enigma = app.model.enigmaModel;
                        var baseUrl = location.href.indexOf('/sense/app') > -1 ? location.href.split('/sense/app')[0] : location.href.split('/single')[0];
                        var xrfkey = 'testconnection99'

                        console.log('via Virtual Proxy?', data.pViaVproxy);
                        var vproxy = data.vproxy;
                        if (data.vproxy.qStringExpression) vproxy = await enigma.evaluate(data.vproxy.qStringExpression.qExpr);
                        var hdrkey = data.hdrkey;
                        if (data.hdrkey.qStringExpression) hdrkey = await enigma.evaluate(data.hdrkey.qStringExpression.qExpr);
                        var hdrval = data.hdrval;
                        if (data.hdrval.qStringExpression) hdrval = await enigma.evaluate(data.hdrval.qStringExpression.qExpr);
                        console.log('Virtual Proxy', vproxy);
                        console.log('Header Key', hdrkey);
                        console.log('Header Value', hdrval);

                        var httpHeaders = { "X-Qlik-XrfKey": xrfkey };
                        var url
                        if (data.pViaVproxy) {
                            url = '/' + vproxy + "/qrs/about"
                            //url = '/' + vproxy + "/qrs/user/full?filter=userId eq '" + hdrval + "'" 
                            //url = '/' + vproxy + "/qrs/virtualproxyconfig" // ?filter=prefix eq '" + vproxy + "'";
                            httpHeaders[hdrkey] = hdrval;
                        } else {
                            url = baseUrl + "/qrs/about"
                            //url = sess.baseUrl + "/qrs/user/full?filter=userId eq '" + sess.user.userId + "' and userDirectory eq '" + sess.user.userDirectory + "'"
                        }
                        $.ajax({
                            method: 'GET',
                            url: url + (url.indexOf('?') == -1 ? '?' : '&') + "xrfkey=" + xrfkey,
                            headers: httpHeaders,
                            success: function (res) {
                                //alert('Success: QRS API is talking to you.'); 
                                console.log('QRS API replied on ' + url, res);
                                functions.leonardoMsg(xrfkey, 'Success',
                                    'QRS API connected at ' + url + '<br/>buildVersion: ' + res.buildVersion
                                    + '<br/>buildDate: ' + res.buildDate, null, 'Close', false);
                            },
                            error: function (xhr, status, error) {
                                //alert('Connection to QRS API don\'t work.'); 
                                functions.leonardoMsg(xrfkey, 'Error',
                                    'The connection to QRS API does\'t work with these settings.', null, 'Close', true);
                            }
                        })
                    }
                    //show: function (layout) { return layout.pViaVproxy; }
                }, {
                    label: "Help",
                    component: "link",
                    url: 'https://github.com/ChristofSchwarz/qs_ext_reloadreplace/blob/master/README.md#virtual-proxy-setup',
                    show: function (layout) { return layout.pViaVproxy; }
                }]
            }
        },

        button1: function (qlik) {   // ---------- reload ----------
            return {
                label: 'Button Reload',
                type: 'items',
                items: [{
                    type: "boolean",
                    defaultValue: true,
                    ref: "pCBreload",
                    label: "Use Button"
                }, {
                    label: 'Button Label',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pBtnLabel1',
                    defaultValue: 'Reload',
                    show: function (data) { return data.pCBreload }
                }, {
                    type: "boolean",
                    component: "switch",
                    label: "Reload Task",
                    ref: "pReloadOwn",
                    options: [{
                        value: true,
                        label: "Reload this app"
                    }, {
                        value: false,
                        label: "Specific app (specify task)"
                    }],
                    defaultValue: true,
                    show: function (data) { return data.pCBreload }
                }, {
                    label: 'Task ID to trigger',
                    type: 'string',
                    ref: 'pTaskId',
                    expression: 'optional',
                    show: function (data) { return data.pCBreload && !data.pReloadOwn }
                }, {
                    label: 'Hide within published apps',
                    type: 'boolean',
                    ref: 'pCBhideIfPublic',
                    defaultValue: false,
                    show: function (data) { return data.pCBreload }
                }, {
                    label: 'Conditional Show',
                    type: 'boolean',
                    ref: 'pCBshowIfFormula',
                    defaultValue: false,
                    show: function (data) { return data.pCBreload }
                }, {
                    label: 'Only show if the follwing is true:',
                    type: 'string',
                    component: 'textarea',
                    rows: 4,
                    expression: 'optional',
                    ref: 'pShowCondition',
                    defaultValue: "=WildMatch(OSUser(), '*QMI-QS-SN*vagrant', '...')\n" +
                        "//put a list of users in single quotes and use format '*DIRECTORY*userid' including the asterisks",
                    show: function (data) { return data.pCBreload && data.pCBshowIfFormula }
                }, {
                    label: "Text color",
                    component: "color-picker",
                    ref: "pTxtColor1",
                    type: "object",
                    //dualOutput: true,
                    defaultValue: "#333333",
                    show: function (data) { return data.pCBreload }
                }, {
                    label: "Background color",
                    component: "color-picker",
                    ref: "pBgColor1",
                    type: "object",
                    defaultValue: "#ffffff",
                    show: function (data) { return data.pCBreload }
                }]
            }
        },

        button2: function (qlik, sessi) {   // ---------- publish & replace ----------
            
            return {
                label: 'Button Replace App',
                type: 'items',
                items: [{
                    type: "boolean",
                    defaultValue: false,
                    ref: "pCBreplace",
                    label: "Use Button"
                }, {
                    label: "In the target app, the button is always hidden.",
                    component: "text",
                    show: function (layout) { return layout.pCBreplace }
                }, {
                    label: 'Button Label',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pBtnLabel2',
                    defaultValue: 'Replace App',
                    show: function (layout) { return layout.pCBreplace }
                }, {
                    label: "Refresh this target app (id)",
                    type: 'string',
                    expression: 'optional',
                    ref: 'pTargetAppId',
                    show: function (layout) { return layout.pCBreplace }
                }, {
                    type: "boolean",
                    component: "switch",
                    label: "To refresh target app",
                    ref: "pUseDBHub",
                    options: [{
                        value: true,
                        label: "use Databridge Hub"
                    }, {
                        value: false,
                        label: "use built-in code"
                    }],
                    defaultValue: false,
                    show: function (layout) { return layout.pCBreplace }
                }, {
                    label: "You don't have Databridge Hub installed.",
                    component: "text",
                    show: function (layout) { return layout.pCBreplace && (layout.pUseDBHub ? !sessi.hasDatabridgeHub : false) }
                }, {
                    label: 'Get it free from Github',
                    component: "link",
                    url: 'https://github.com/ChristofSchwarz/db_mash_databridgehub',
                    show: function (layout) { return layout.pCBreplace && (layout.pUseDBHub ? !sessi.hasDatabridgeHub : false) }
                }, {
                    label: "Go to Databridge Hub mashup",
                    component: "link",
                    url: sessi.databridgeHubUrl,
                    show: function (layout) { return layout.pCBreplace && (layout.pUseDBHub ? !sessi.hasDatabridgeHub : false) }
                }, {
                    label: 'Copy Design',
                    type: 'boolean',
                    ref: 'pCopyDesign',
                    defaultValue: true,
                    show: function (layout) { return layout.pCBreplace && (layout.pUseDBHub ? !sessi.hasDatabridgeHub : false) }
                }, {
                    label: 'Copy Data',
                    type: 'boolean',
                    ref: 'pCopyData',
                    defaultValue: true,
                    show: function (layout) { return layout.pCBreplace && (layout.pUseDBHub ? !sessi.hasDatabridgeHub : false) }
                }, {
                    label: 'Copy Script',
                    type: 'boolean',
                    ref: 'pCopyScript',
                    defaultValue: true,
                    show: function (layout) { return layout.pCBreplace && (layout.pUseDBHub ? !sessi.hasDatabridgeHub : false) }
                }, {
                    label: "Text color",
                    component: "color-picker",
                    ref: "pTxtColor2",
                    type: "object",
                    //dualOutput: true,
                    defaultValue: "#333333",
                    show: function (layout) { return layout.pCBreplace }
                }, {
                    label: "Background color",
                    component: "color-picker",
                    ref: "pBgColor2",
                    type: "object",
                    defaultValue: "#ffffff",
                    show: function (layout) { return layout.pCBreplace }
                }]
            }
        },

        button3: function (qlik) {  // ---------- save objects ----------
            return {
                label: 'Button Save Object Definitions',
                type: 'items',
                items: [{
                    type: "boolean",
                    defaultValue: false,
                    ref: "pCBstream",
                    label: "Use Button"
                }, {
                    label: 'Button Label',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pBtnLabel3',
                    defaultValue: 'Save Object',
                    show: function (data) { return data.pCBstream }
                }, {
                    label: 'Source Object(s) (comma-separated list)',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pSourceObjectIds',
                    defaultValue: '',
                    show: function (data) { return data.pCBstream }
                }, {
                    label: 'Write to extension',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pExtension',
                    defaultValue: 'DevelopersFriend',
                    show: function (data) { return data.pCBstream }
                }, {
                    label: 'write to filename',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pFilename',
                    defaultValue: 'dummy.json',
                    show: function (data) { return data.pCBstream }
                }, {
                    label: "Text color",
                    component: "color-picker",
                    ref: "pTxtColor3",
                    type: "object",
                    //dualOutput: true,
                    defaultValue: "#333333",
                    show: function (data) { return data.pCBstream }
                }, {
                    label: "Background color",
                    component: "color-picker",
                    ref: "pBgColor3",
                    type: "object",
                    defaultValue: "#ffffff",
                    show: function (data) { return data.pCBstream }
                }]
            }
        },

        button4: function (qlik) {  // ---------- export app ----------
            return {
                label: 'Button Export App',
                type: 'items',
                items: [{
                    type: "boolean",
                    defaultValue: false,
                    ref: "pCBexport",
                    label: "Use Button"
                }, {
                    label: 'Button Label',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pBtnLabel4',
                    defaultValue: 'Export App',
                    show: function (data) { return data.pCBexport }
                }, {
                    type: "boolean",
                    defaultValue: true,
                    ref: "pWithData",
                    label: "Export With Data",
                    show: function (data) { return data.pCBexport }
                }, {
                    type: "boolean",
                    component: "switch",
                    label: "Sheets List",
                    ref: "pCPinclude",
                    options: [{
                        value: true,
                        label: "Include below sheets"
                    }, {
                        value: false,
                        label: "Exclude below sheets"
                    }],
                    defaultValue: false,
                    show: function (data) { return data.pCBexport }
                }, {
                    type: "array",
                    ref: "listItems",
                    label: "List Items",
                    itemTitleRef: "label",
                    allowAdd: true,
                    allowRemove: true,
                    addTranslation: "Add Item",
                    show: function (data) { return data.pCBexport },
                    items: {
                        label: {
                            //type: "string",
                            type: "dropdown",
                            ref: "label",
                            label: "Sheet Name",
                            //expression: "optional"
                            component: "dropdown",
                            options: async function () {
                                var app = qlik.currApp();
                                var enigma = app.model.enigmaModel;
                                var sessObj = await enigma.createSessionObject({
                                    qInfo: { qType: "SheetList" },
                                    qAppObjectListDef: {
                                        qType: "sheet",
                                        qData: {
                                            title: "/qMetaDef/title",
                                            description: "/qMetaDef/description",
                                            rank: "/rank"
                                        }
                                    }
                                }); var sheetList = await sessObj.getLayout();
                                var ret = [];
                                //console.log(sheetList);
                                sheetList.qAppObjectList.qItems.forEach(function (e) {
                                    //console.log(e);
                                    ret.push({ label: e.qData.title, value: e.qData.title + ('\xa0').repeat(60) + '\n' + e.qInfo.qId });
                                });
                                return ret;
                            }
                        }
                    }
                }, {
                    label: "Warning: No sheet will be exported!",
                    component: "text",
                    show: function (data) {
                        return data.listItems.length == 0 && data.pCPinclude && data.pCBexport
                    }
                }, {
                    label: "Text color",
                    component: "color-picker",
                    ref: "pTxtColor4",
                    type: "object",
                    //dualOutput: true,
                    defaultValue: "#333333",
                    show: function (data) { return data.pCBexport }
                }, {
                    label: "Background color",
                    component: "color-picker",
                    ref: "pBgColor4",
                    type: "object",
                    defaultValue: "#ffffff",
                    show: function (data) { return data.pCBexport }
                }]
            }
        },

        button5: function (qlik) {  // ---------- create mappings ----------
            return {
                label: 'Button Save Mappings',
                type: 'items',
                items: [{
                    type: "boolean",
                    defaultValue: false,
                    ref: "pCBmappings",
                    label: "Use Button"
                }, {
                    label: 'Button Label',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pBtnLabel5',
                    defaultValue: 'Mappings',
                    show: function (data) { return data.pCBmappings }
                }, {
                    label: 'Save in extension',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pMapExtension',
                    defaultValue: 'mappings',
                    show: function (data) { return data.pCBmappings }
                }, {
                    label: 'Filename',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pMapFilename',
                    defaultValue: 'dummy.css',
                    show: function (data) { return data.pCBmappings }
                }, {
                    label: 'Check condition before use',
                    type: 'integer',
                    expression: 'always',
                    ref: 'pMapCondition',
                    defaultValue: '=1 //GetSelectedCount(product.name)>1',
                    show: function (data) { return data.pCBmappings }
                }, {
                    label: 'Error msg if condition is false',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pMapMessage',
                    defaultValue: 'Condition is not met.',
                    show: function (data) { return data.pCBmappings }
                }, {
                    label: 'Keys (separate with CHR(10))',
                    type: 'string',
                    expression: 'always',
                    ref: 'pMapKeyVals',
                    defaultValue: '=Concat(DISTINCT product.name, CHR(10))',
                    show: function (data) { return data.pCBmappings }
                }, {
                    type: "array",
                    ref: "pMapWriteFields", //"listItems",
                    label: "Save field(s)",
                    itemTitleRef: "label",
                    allowAdd: true,
                    allowRemove: true,
                    addTranslation: "Add Item",
                    items: [
                        {
                            type: "string",
                            ref: "label",
                            label: "Label",
                            expression: "optional",
                            defaultValue: "='Map ' & Count(DISTINCT product.name) & ' products'",
                        }, {
                            label: 'Option(s) (separate with CHR(10))',
                            type: 'string',
                            expression: 'optional',
                            ref: 'mapFieldOptions',
                            defaultValue: "='Concat(DISTINCT product.name, CHR(10))'",
                        }, {
                            label: 'Default Option',
                            type: 'string',
                            expression: 'optional',
                            ref: 'mapFieldDefault',
                            defaultValue: '=MaxString(product.name)',
                        }, {
							label: 'Separate dropdowns split at char',
                            type: 'string',
                            ref: 'mapFieldSplitChar',
                            defaultValue: ''
						}
                    ],
                    show: function (data) { return data.pCBmappings }
                }, {
                    label: "Add username + timestamp",
                    ref: "pMapAddUsername",
                    type: "boolean",
                    defaultValue: true,
                    show: function (data) { return data.pCBmappings }
                }, /*{
                    label: "Save space for repeating rows",
                    ref: "pSaveSpace",
                    type: "boolean",
                    defaultValue: false,
                    show: function (data) { return data.pCBmappings }
                },*/ {
                    label: 'Trigger Action Button ID when done',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pTriggerButton',
                    defaultValue: '',
                    show: function (data) { return data.pCBmappings }
                }, {
                    label: "Set variable when done",
                    ref: "pUseSetVariable",
                    type: "boolean",
                    defaultValue: false,
                    show: function (data) { return data.pCBmappings }
                },{
                    label: 'Set this variable',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pSetThisVariable1',
                    defaultValue: '',
                    show: function (data) { return data.pCBmappings && data.pUseSetVariable }
                }, {
                    label: '... to this value',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pSetVariableValue1',
                    defaultValue: '',
                    show: function (data) { return data.pCBmappings && data.pUseSetVariable }
                }, {
                    label: "Text color",
                    component: "color-picker",
                    ref: "pTxtColor5",
                    type: "object",
                    //dualOutput: true,
                    defaultValue: "#333333",
                    show: function (data) { return data.pCBmappings }
                }, {
                    label: "Background color",
                    component: "color-picker",
                    ref: "pBgColor5",
                    type: "object",
                    defaultValue: "#ffffff",
                    show: function (data) { return data.pCBmappings }
                }]
            }
        },

        button6: function (qlik) {  // ---------- delete mappings ----------
            return {
                label: 'Button Delete Mapping',
                type: 'items',
                items: [{
                    type: "boolean",
                    defaultValue: false,
                    ref: "pCBdelete",
                    label: "Use Button"
                }, {
                    label: 'Button Label',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pBtnLabel6',
                    defaultValue: 'Delete Mapping',
                    show: function (data) { return data.pCBdelete }
                }, {
                    label: 'Mappings stored in extension',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pDelExtension',
                    defaultValue: 'mappings',
                    show: function (data) { return data.pCBdelete }
                }, {
                    label: 'Filename',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pDelFilename',
                    defaultValue: 'dummy.css',
                    show: function (data) { return data.pCBdelete }
                }, {
                    label: 'Check condition before use',
                    type: 'integer',
                    expression: 'always',
                    ref: 'pDelCondition',
                    defaultValue: '=1 //GetSelectedCount(product.name)>1',
                    show: function (data) { return data.pCBdelete }
                }, {
                    label: 'Error msg if condition is false',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pDelMessage',
                    defaultValue: 'Condition is not met.',
                    show: function (data) { return data.pCBdelete }
                }, {
                    label: 'Keys to delete (separate with CHR(10))',
                    type: 'string',
                    expression: 'always',
                    ref: 'pDelKeyVals',
                    defaultValue: '=Concat(DISTINCT %productId, CHR(10))',
                    show: function (data) { return data.pCBdelete }
                }, {
                    label: "Set variable when done",
                    ref: "pUseSetVariable2",
                    type: "boolean",
                    defaultValue: false,
                    show: function (data) { return data.pCBdelete }
                },{
                    label: 'Set this variable',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pSetThisVariable2',
                    defaultValue: '',
                    show: function (data) { return data.pCBdelete && data.pUseSetVariable2 }
                }, {
                    label: '... to this value',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pSetVariableValue2',
                    defaultValue: '',
                    show: function (data) { return data.pCBdelete && data.pUseSetVariable2 }
                }, {
                    label: "Text color",
                    component: "color-picker",
                    ref: "pTxtColor6",
                    type: "object",
                    //dualOutput: true,
                    defaultValue: "#333333",
                    show: function (data) { return data.pCBdelete }
                }, {
                    label: "Background color",
                    component: "color-picker",
                    ref: "pBgColor6",
                    type: "object",
                    defaultValue: "#ffffff",
                    show: function (data) { return data.pCBdelete }
                }]
            }
        },
		
       button7: function (qlik) {  // ---------- iframe ----------
            return {
                label: 'Button Open iframe',
                type: 'items',
                items: [{
                    type: "boolean",
                    defaultValue: false,
                    ref: "pCBiframe",
                    label: "Use Button"
                }, {
                    label: 'Button Label',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pBtnLabel7',
                    defaultValue: 'Open iframe',
                    show: function (data) { return data.pCBiframe }
                }, {
                    label: 'iFrame Title',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pIframeTitle',
                    defaultValue: '',
                    show: function (data) { return data.pCBiframe }
                },{
                    label: 'iFrame Url',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pIframeSrc',
                    defaultValue: '',
                    show: function (data) { return data.pCBiframe }
                }, {
                    label: "Text color",
                    component: "color-picker",
                    ref: "pTxtColor7",
                    type: "object",
                    //dualOutput: true,
                    defaultValue: "#333333",
                    show: function (data) { return data.pCBiframe }
                }, {
                    label: "Background color",
                    component: "color-picker",
                    ref: "pBgColor7",
                    type: "object",
                    defaultValue: "#ffffff",
                    show: function (data) { return data.pCBiframe }
                }, {
                    label: 'Set this variable',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pSetThisVariable3',
                    defaultValue: '',
                    show: function (data) { return data.pCBiframe  }
                }, {
                    label: '... to this value',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pSetVariableValue3',
                    defaultValue: '',
                    show: function (data) { return data.pCBiframe }
                }]
            }
        },

        presentation: function (qlik) {
            return {
                label: 'Presentation',
                type: 'items',
                items: [ 
				/*{
                    label: 'Button width',
                    type: 'integer',
                    ref: 'pBtnWidth',
                    component: 'slider',
                    min: 10,
                    max: 99,
                    step: 1,
                    defaultValue: 95
                },*/ 
				{
                    type: "number",
                    component: "dropdown",
                    label: "Button Width",
                    ref: "pBtnWidth2",
                    options: [
                        { value: 100, label: "1 per row" },
                        { value: 100/2, label: "2 per row" },
                        { value: 100/3, label: "3 per row" },
						{ value: 100/4, label: "4 per row" },
						{ value: 100/5, label: "5 per row" },
						{ value: 100/6, label: "6 per row" }
                    ],
                }, {
                    type: "string",
                    component: "dropdown",
                    label: "Show in the buttons",
                    ref: "pIconTxt",
                    defaultValue: "it",
                    options: [
                        { value: "t", label: "Text" },
                        { value: "i", label: "Icon" },
                        { value: "it", label: "Icon and Text" }
                    ],
                }, {
                    type: "boolean",
                    defaultValue: false,
                    ref: "pNoBkgr",
                    label: "Turn off background"
                }]
            }
        },

        about: function (qext) {
            return {
                version: {
                    label: function (arg) { return 'Extension version ' + qext.version; },
                    component: "link",
                    url: '../extensions/DevelopersFriend/DevelopersFriend.qext'
                },
                txt1: {
                    label: "This extension is free of charge by data/\\bridge, Qlik OEM partner and specialist for Mashup integrations.",
                    component: "text"
                },
                txt2: {
                    label: "Use as is. No support without a maintenance subscription.",
                    component: "text"
                },
                dbLogo: {
                    label: "",
                    component: "text"
                },
                btn: {
                    label: "About Us",
                    component: "link",
                    url: 'https://www.databridge.ch'
                } /*,
                docu: {
                    label: "Open Documentation",
                    component: "button",
                    action: function (arg) {
                        window.open('https://github.com/ChristofSchwarz/qs_ext_reloadreplace', '_blank');
                    }
                } */
            }
        }
    }
});
