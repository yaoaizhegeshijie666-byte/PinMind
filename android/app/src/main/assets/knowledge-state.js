const PinMindState=(()=>{
  const KEYS={collected:'pinmind.collected',library:'pinmind.libraryItems',uncollected:'pinmind.uncollected',read:'pinmind.readDates'};
const DEMO=new Set(['AI 自动化程度越高，越需要保留用户的关键决策权。','收藏的价值不在于数量，而在于它是否能被下一次思考重新调用。','用户说“想要更智能”，往往是在要求减少判断成本，而不是增加 AI 功能。','用户信任来自可理解、可控制和可撤销','设计 AI 失败后的恢复路径','不可逆操作应当由人作出最终决定','收藏的价值，在于它能否被下一次思考重新调用。','主题关系比时间顺序更接近思考方式']);
  const readArray=key=>{try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return[]}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const itemKey=item=>item?.headline||'';
  const collected=()=>new Set(readArray(KEYS.collected));
  const library=()=>readArray(KEYS.library);
  const uncollected=()=>readArray(KEYS.uncollected);
  const readDates=()=>new Set(readArray(KEYS.read));
  function isCollected(item){return collected().has(itemKey(item));}
  function isRead(date){return readDates().has(date)||localStorage.getItem('pinmind.read.'+date)==='1';}
  function saveLibrary(item,on,date){
    const key=itemKey(item),items=library().filter(entry=>itemKey(entry)!==key);
    if(on)items.push({...item,digestDate:date});write(KEYS.library,items);
  }
  function saveUncollected(item,on,date){
    const key=itemKey(item),items=uncollected().filter(entry=>itemKey(entry)!==key);
    if(on)items.push({...item,digestDate:date});write(KEYS.uncollected,items);
  }
  function toggleCollected(item,date){
    const key=itemKey(item),keys=collected(),on=!keys.has(key);
    if(on)keys.add(key);else keys.delete(key);
    write(KEYS.collected,[...keys]);saveLibrary(item,on,date);saveUncollected(item,!on&&isRead(date),date);
    window.dispatchEvent(new CustomEvent('pinmind:knowledge-state-changed',{detail:{item,date,collected:on}}));return on;
  }
  function markRead(date,items){
    const dates=readDates();dates.add(date);write(KEYS.read,[...dates]);localStorage.setItem('pinmind.read.'+date,'1');
    items.forEach(item=>saveUncollected(item,!isCollected(item),date));
    window.dispatchEvent(new CustomEvent('pinmind:read-state-changed',{detail:{date}}));
  }
  function deleteUncollected(item){saveUncollected(item,false,item.digestDate);}
  function migrate(){const keptLibrary=library().filter(item=>!DEMO.has(itemKey(item))),keptUncollected=uncollected().filter(item=>!DEMO.has(itemKey(item))),keys=new Set([...collected()].filter(key=>!DEMO.has(key)));keptLibrary.forEach(item=>keys.add(itemKey(item)));write(KEYS.library,keptLibrary);write(KEYS.uncollected,keptUncollected);write(KEYS.collected,[...keys]);}
  return {isCollected,isRead,toggleCollected,markRead,library,uncollected,deleteUncollected,migrate};
})();
window.PinMindState=PinMindState;
