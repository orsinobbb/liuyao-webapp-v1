const KEY='liuyao.history.v1';
export function loadHistory(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
export function saveHistory(chart){const h=loadHistory();h.unshift(chart);localStorage.setItem(KEY,JSON.stringify(h.slice(0,30)));return h.slice(0,30)}
export function clearHistory(){localStorage.removeItem(KEY)}
