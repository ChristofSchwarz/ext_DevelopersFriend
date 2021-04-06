// functions needed in DevelopersFriend.js ...

// Custom Properties
// https://help.qlik.com/en-US/sense-developer/November2020/Subsystems/Extensions/Content/Sense_Extensions/Howtos/custom-slider-properties.htm

define([], function () {
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
                    defaultValue: true
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
                }, /* {
                    label: 'Run as',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pRunAs',
                    defaultValue: 'UserDirectory=INTERNAL;UserId=sa_api'
                },*/ {
                    label: "Help",
                    component: "button",
                    action: function (arg) {
                        window.open('https://github.com/ChristofSchwarz/qs_ext_reloadreplace/blob/master/README.md#virtual-proxy-setup', '_blank');
                    },
                    show: function (layout) { return layout.pViaVproxy; }
                }]
            }
        },

        button1: function (qlik) {
            return {
                label: 'Reload Button',
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

        button2: function (qlik, databridgeHubUrl) {
            var hasDatabridgeHub = $.ajax({ type: "HEAD", url: databridgeHubUrl, async: false });

            return {
                label: 'Replace App Button',
                type: 'items',
                items: [{
                    type: "boolean",
                    defaultValue: true,
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
                    show: function (data) { return data.pCBreplace }
                }, {
                    label: "Refresh this target app (id)",
                    type: 'string',
                    expression: 'optional',
                    ref: 'pTargetAppId',
                    show: function (data) { return data.pCBreplace }
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
                    defaultValue: true
                },
                {
                    label: "You don't have Databridge Hub installed.",
                    component: "text",
                    show: function (layout) { return layout.pUseDBHub ? !(hasDatabridgeHub.status == 200) : false }
                }, {
                    label: 'Get it free from Github',
                    component: "link",
                    url: 'https://github.com/ChristofSchwarz/db_mash_databridgehub',
                    show: function (layout) { return layout.pUseDBHub ? !(hasDatabridgeHub.status == 200) : false }
                }, {
                    label: "Go to Databridge Hub mashup",
                    component: "link",
                    url: databridgeHubUrl,
                    show: function (layout) { return layout.pUseDBHub ? (hasDatabridgeHub.status == 200) : false }
                }, {
                    label: 'Copy Design',
                    type: 'boolean',
                    ref: 'pCopyDesign',
                    defaultValue: true,
                    show: function (layout) { return layout.pUseDBHub ? (hasDatabridgeHub.status == 200) : false }
                }, {
                    label: 'Copy Data',
                    type: 'boolean',
                    ref: 'pCopyData',
                    defaultValue: true,
                    show: function (layout) { return layout.pUseDBHub ? (hasDatabridgeHub.status == 200) : false }
                }, {
                    label: 'Copy Script',
                    type: 'boolean',
                    ref: 'pCopyScript',
                    defaultValue: true,
                    show: function (layout) { return layout.pUseDBHub ? (hasDatabridgeHub.status == 200) : false }
                }, {
                    label: "Text color",
                    component: "color-picker",
                    ref: "pTxtColor2",
                    type: "object",
                    //dualOutput: true,
                    defaultValue: "#333333",
                    show: function (data) {
                        return data.pCBreplace == true
                    }
                }, {
                    label: "Background color",
                    component: "color-picker",
                    ref: "pBgColor2",
                    type: "object",
                    defaultValue: "#ffffff",
                    show: function (data) {
                        return data.pCBreplace == true
                    }
                }]
            }
        },

        button3: function (qlik) {
            return {
                label: 'Save Object Definitions Button',
                type: 'items',
                items: [{
                    type: "boolean",
                    defaultValue: true,
                    ref: "pCBstream",
                    label: "Use Button"
                }, {
                    label: 'Button Label',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pBtnLabel3',
                    defaultValue: 'Save Object',
                    show: function (data) {
                        return data.pCBstream == true
                    }
                }, {
                    label: 'Source Object(s) (comma-separated list)',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pSourceObjectIds',
                    defaultValue: '',
                    show: function (data) {
                        return data.pCBstream == true
                    }
                }, {
                    label: 'Write to extension',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pExtension',
                    defaultValue: 'DevelopersFriend',
                    show: function (data) {
                        return data.pCBstream == true
                    }
                }, {
                    label: 'write to filename',
                    type: 'string',
                    expression: 'optional',
                    ref: 'pFilename',
                    defaultValue: 'dummy.json',
                    show: function (data) {
                        return data.pCBstream == true
                    }
                }, {
                    label: "Text color",
                    component: "color-picker",
                    ref: "pTxtColor3",
                    type: "object",
                    //dualOutput: true,
                    defaultValue: "#333333",
                    show: function (data) {
                        return data.pCBstream == true
                    }
                }, {
                    label: "Background color",
                    component: "color-picker",
                    ref: "pBgColor3",
                    type: "object",
                    defaultValue: "#ffffff",
                    show: function (data) {
                        return data.pCBstream == true
                    }
                }]
            }
        },

        button4: function (qlik) {
            return {
                label: 'Export App Button',
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
                    show: function (data) {
                        return data.pCBexport == true
                    }
                }, {
                    type: "boolean",
                    defaultValue: true,
                    ref: "pWithData",
                    label: "Export With Data",
                    show: function (data) {
                        return data.pCBexport == true
                    }
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
                    show: function (data) {
                        return data.pCBexport == true
                    }
                }, {
                    type: "array",
                    ref: "listItems",
                    label: "List Items",
                    itemTitleRef: "label",
                    allowAdd: true,
                    allowRemove: true,
                    addTranslation: "Add Item",
                    show: function (data) {
                        return data.pCBexport == true
                    },
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
                    show: function (data) {
                        return data.pCBexport == true
                    }
                }, {
                    label: "Background color",
                    component: "color-picker",
                    ref: "pBgColor4",
                    type: "object",
                    defaultValue: "#ffffff",
                    show: function (data) {
                        return data.pCBexport == true
                    }
                }]
            }
        },


        presentation: function (qlik) {
            return {
                label: 'Presentation',
                type: 'items',
                items: [{
                    label: 'Button width',
                    type: 'integer',
                    ref: 'pBtnWidth',
                    component: 'slider',
                    min: 10,
                    max: 99,
                    step: 1,
                    defaultValue: 95
                }, {
                    type: "string",
                    component: "dropdown",
                    label: "Show in the buttons",
                    ref: "pIconTxt",
                    defaultValue: "t",
                    options: [
                        { value: "t", label: "Text" },
                        { value: "i", label: "Icon" },
                        { value: "it", label: "Icon and Text" }
                    ],
                }]
            }
        },

        about: function ($) {
            return {
                version: {
                    label: 'Extension version',
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
                },
                docu: {
                    label: "Open Documentation",
                    component: "button",
                    action: function (arg) {
                        window.open('https://github.com/ChristofSchwarz/qs_ext_reloadreplace', '_blank');
                    }
                }
            }
        }
    }
});