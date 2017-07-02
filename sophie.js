const APPLICABLE_PROTOCOLS = ['http:', 'https:'];
const APPLICABLE_SITES = ['www.export.kaiserkraft.com', 'www.kaiserkraft', 'www.garner', 'www.kwesto', 'www.vinklisse.nl', 'www.frankel.fr', 'www.hoffmann-zeist.nl', 'www.powellmailorder.co.uk'];

/**
 *
 * @param {string} value A string which contains the jSessionId e.g. C74C6DF46A341DCF628A0A25992E2029.as03
 * @returns {string} The machine name e.g. as03
 */
const getMachineName = ({value}) => {
    const [sessionId, machineName] = value.split('.');
    return machineName;
};

/**
 * @param {Array.<{name: string}>} cookies All cookies of the website
 * @returns {{key: string, value: string}} The JSessionId cookie
 */
const getJSessionValue = cookies => {
    const [jSessionValue] = cookies.filter(cookie => cookie.name === 'JSESSIONID');
    return jSessionValue;
};

/**
 * @param {number} tabId The identifier of the current tab
 * @param {string} machineName The name of the machine we're currently on e.g. as03
 */
const updatePageActionWithMachineInfo = (tabId, machineName) => {
    browser.pageAction.setTitle({
        tabId: tabId,
        title: machineName
    });
    browser.pageAction.setIcon({
        tabId: tabId,
        path: `icons/${machineName}.svg`
    });
};

/**
 * @param {{url: string, id: number}} tab
 * @returns {Array.<{name: string}>} All cookies of the website
 */
const getCookies = tab => browser.cookies.getAll({url: tab.url});

/**
 * @param {string} url The URL of the current tab
 * @returns {boolean} Whether our script is applicable for the current protocol or not
 */
const protocolIsApplicable = url => {
    const anchor = document.createElement('a');
    anchor.href = url;
    return APPLICABLE_PROTOCOLS.includes(anchor.protocol);
};

/**
 * @param {string} url The URL of the current tab
 * @returns {boolean} Whether our script is applicable for the current website or not
 */
const siteIsApplicable = url => APPLICABLE_SITES.some(site => url.indexOf(site) !== -1);

/**
 * @param {{url: string, id: number}} tab
 * @param {Array.<{name: string}>} cookies All cookies of the website
 */
const handleGetCookiesSuccess = (tab, cookies) => {
    const jSessionValue = getJSessionValue(cookies);
    const machineName = getMachineName(jSessionValue);
    updatePageActionWithMachineInfo(tab.id, machineName);
    browser.pageAction.show(tab.id);
};

/**
 * @param {{url: string, id: number}} tab
 */
const initializePageAction = tab => {
    if (protocolIsApplicable(tab.url) && siteIsApplicable(tab.url)) {
        getCookies(tab).then(handleGetCookiesSuccess.bind(null, tab));
    }
};

browser.tabs.onUpdated.addListener((id, changeInfo, tab) => initializePageAction(tab));
