
export const search = async (saerchTerm:string,type=undefined) => {
    let params:any = {
        "q":saerchTerm,
    }
    if(type)
        params.type = type;

    let url = '/api/search?' +     
    new URLSearchParams(params).toString();

    let response = await (await fetch(url)).json();
    return response;
  }    