const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

class UPDormZimInternetLib {

  constructor(dormid) {
    this.dormid = dormid;
  }

  async getUsedVolume() {
    return new Promise(((resolve, _reject) => {
      const xhttp = new XMLHttpRequest();
      xhttp.open('GET', `https://www.intern.uni-potsdam.de/zim/psn/${this.dormid}`);
      xhttp.onload = (() => {
        if (xhttp.status >= 200 && xhttp.status < 300) {
          const r = new RegExp(`(${this.ip})(.*)(\\n)`);
          const matches = xhttp.responseText.match(r);
          resolve(parseInt(matches[0].substring(this.ip.length).replace('\t', '').replace(' ', '').replace('\n', '')));
        }
      }).bind(this);
      xhttp.send();
    }).bind(this));
  }

  async getMaxVolume() {
    return new Promise(((resolve, _reject) => {
      const xhttp = new XMLHttpRequest();
      xhttp.open('GET', `https://www.intern.uni-potsdam.de/zim/psn/${this.dormid}`);
      xhttp.onload = (() => {
        if (xhttp.status >= 200 && xhttp.status < 300) {
          const r = new RegExp(`(derzeit)(.*)(MByte)`);
          const matches = xhttp.responseText.match(r);
          resolve(parseInt(matches[2].replace('\t', '').replace(' ', '').replace('\n', '')));
        }
      }).bind(this);
      xhttp.send();
    }).bind(this));
  }

  async getIP() {
    return new Promise(((resolve, _reject) => {
      const xhttp = new XMLHttpRequest();
      xhttp.open('GET', 'https://api.ipify.org/?format=json');
      xhttp.onload = () => {
        if (xhttp.status >= 200 && xhttp.status < 300) {
          this.ip = JSON.parse(xhttp.responseText).ip;
          resolve(this.ip);
        }
      };
      xhttp.send();
    }).bind(this));
  }
}

module.exports = UPDormZimInternetLib;
