export const STEMS = [...'甲乙丙丁戊己庚辛壬癸'];
export const BRANCHES = [...'子丑寅卯辰巳午未申酉戌亥'];
export const ELEMENTS = ['木','火','土','金','水'];
export const SIX_RELATIVES = ['兄弟','子孫','妻財','官鬼','父母'];
export const SIX_SPIRITS = ['青龍','朱雀','勾陳','螣蛇','白虎','玄武'];
export const LINE_LABELS = ['初爻','二爻','三爻','四爻','五爻','上爻'];
export const VALUE_META = {
  6:{name:'老陰',yang:false,moving:true,glyph:'⚋',changedGlyph:'⚊'},
  7:{name:'少陽',yang:true,moving:false,glyph:'⚊',changedGlyph:'⚊'},
  8:{name:'少陰',yang:false,moving:false,glyph:'⚋',changedGlyph:'⚋'},
  9:{name:'老陽',yang:true,moving:true,glyph:'⚊',changedGlyph:'⚋'}
};
export const ELEMENT_OF_BRANCH = {子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
export const GENERATES = {木:'火',火:'土',土:'金',金:'水',水:'木'};
export const CONTROLS = {木:'土',土:'水',水:'火',火:'金',金:'木'};
export const SIXTY = Array.from({length:60}, (_,i)=>STEMS[i%10]+BRANCHES[i%12]);
