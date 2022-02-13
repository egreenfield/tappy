

export function filterByList<T extends any>(source:T[],field:string,list:string[]) {
    let tMap = list.reduce<Record<string,boolean>>((m,v)=>{m[v] = true;return m},{});
    return source.filter((v:any)=>tMap[v[field]] === true);
}