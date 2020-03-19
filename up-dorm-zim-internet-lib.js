const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

class UPDormZimInternetLib {

  constructor(dormid) {
    this.dormid = dormid;
  }

  async getUsedVolume() {
    const _self = this;
    return new Promise((resolve, reject) => {
      const xhttp = new XMLHttpRequest();
      xhttp.open('GET', `https://www.intern.uni-potsdam.de/zim/psn/${_self.dormid}`);
      xhttp.onload = () => {
        if (xhttp.status >= 200 && xhttp.status < 300) {
          const r = new RegExp(`(${_self.ip})(.*)(\\n)`);
          const matches = xhttp.responseText.match(r);
          resolve(parseInt(matches[0].substring(_self.ip.length).replace('\t', '').replace(' ', '').replace('\n', '')));
        }
      };
      xhttp.send();
    });
  }

  async getMaxVolume() {
    const _self = this;
    return new Promise((resolve, reject) => {
      const xhttp = new XMLHttpRequest();
      xhttp.open('GET', `https://www.intern.uni-potsdam.de/zim/psn/${_self.dormid}`);
      xhttp.onload = () => {
        if (xhttp.status >= 200 && xhttp.status < 300) {
          const r = new RegExp(`(derzeit)(.*)(MByte)`);
          const matches = xhttp.responseText.match(r);
          resolve(parseInt(matches[2].replace('\t', '').replace(' ', '').replace('\n', '')));
        }
      };
      xhttp.send();
    });
  }

  async getIP() {
    const _self = this;
    return new Promise((resolve, reject) => {
      const xhttp = new XMLHttpRequest();
      xhttp.open('GET', 'https://api.ipify.org/?format=json');
      xhttp.onload = () => {
        if (xhttp.status >= 200 && xhttp.status < 300) {
          _self.ip = JSON.parse(xhttp.responseText).ip;
          resolve(_self.ip);
        }
      };
      xhttp.send();
    });
  }
}

module.exports = UPDormZimInternetLib;
