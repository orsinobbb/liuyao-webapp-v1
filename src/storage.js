const KEY='liuyao.history.v1';
const FEEDBACK_KEY='liuyao.feedback.v1';
export function loadHistory(){try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(value)?value:[]}catch{return []}}
export function saveHistory(chart){const h=loadHistory();h.unshift(chart);localStorage.setItem(KEY,JSON.stringify(h.slice(0,30)));return h.slice(0,30)}
export function loadFeedbackMap(){try{const value=JSON.parse(localStorage.getItem(FEEDBACK_KEY)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}catch{return {}}}
export function saveChartFeedback(chartId,feedback){const value=loadFeedbackMap();value[chartId]=feedback;localStorage.setItem(FEEDBACK_KEY,JSON.stringify(value));return feedback}
export function clearHistory(){localStorage.removeItem(KEY);localStorage.removeItem(FEEDBACK_KEY)}
