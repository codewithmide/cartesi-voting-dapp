const input = {"method":"vote","sender":"0x7921805F011d4063984e48c9b47D387D38096777","proposalIndex":0};
const hexInput = '0x' + Buffer.from(JSON.stringify(input)).toString('hex');
console.log(hexInput);