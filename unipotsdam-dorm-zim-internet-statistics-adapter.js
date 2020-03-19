'use strict';

const {
  Adapter,
  Database,
  Device,
  Property,
} = require('gateway-addon');
const manifest = require('./manifest.json');
const UPDormZimInternetLib = require('./up-dorm-zim-internet-lib');

class UnipotsdamDormZimInternetStatisticsDevice extends Device {
  constructor(adapter, lib, maxdatavolume) {
    super(adapter, 'unipotsdam-dorm-zim-internet-statistics');

    this.lib = lib;
    this.maxdatavolume = maxdatavolume;

    const deviceDescription = {
      name: 'Internet statistics',
      '@type': ['MultiLevelSensor'],
      description: 'Internet statistics',
      properties: {
        used: {
          '@type': 'LevelProperty',
          label: 'used data volume (GB)',
          name: 'used',
          type: 'number',
          minimum: 0,
          maximum: maxdatavolume/1024.0,
          value: 0,
          multipleOf: 1/100.0,
          readOnly: true,
        },
        remainingDays: {
          label: 'days remaining',
          name: 'remainingDays',
          type: 'integer',
          value: 0,
          readOnly: true,
        },
      },
    };

    this.name = deviceDescription.name;
    this.type = deviceDescription.type;
    this['@type'] = deviceDescription['@type'];
    this.description = deviceDescription.description;

    this.usedProperty = new Property(this, 'used', deviceDescription.properties.used);
    this.properties.set('used', this.usedProperty);
    this.remainingDaysProperty = new Property(this, 'remainingDays', deviceDescription.properties.remainingDays);
    this.properties.set('remainingDays', this.remainingDaysProperty);

    this.links.push({
      rel: 'alternate',
      mediaType: 'text/html',
      href: `http://sfite.de/noodlehome/internetcheck.html`,
    });

    this.updateUsed();
    this.updateRemainingDays();
  }

  async updateUsed() {
    const v = await this.lib.getUsedVolume();
    this.usedProperty.setCachedValue(v/1024.0);
    this.notifyPropertyChanged(this.usedProperty);
    console.log('updated data volume used to', v);
    console.log('schedule next update in ', this.adapter.config.pollInterval*1000, 'ms');
    setTimeout(this.updateUsed.bind(this), this.adapter.config.pollInterval*1000);
  }

  async updateRemainingDays() {
    const v = this.getRemanningDays();
    this.remainingDaysProperty.setCachedValue(v);
    this.notifyPropertyChanged(this.remainingDaysProperty);
    console.log('updated remaining days to', v);
    console.log('schedule next update in ', this.getMsUntilTomorrow(), 'ms');
    setTimeout(this.updateRemainingDays.bind(this), this.getMsUntilTomorrow());
  }

  getRemanningDays() {
    const now = new Date();
    const date = new Date(+new Date(now.getFullYear(), now.getMonth()+1) - 1);
    return Math.ceil(this.getMsUntil(date) / (1000*60*60*24));
  }

  getMsUntilTomorrow() {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1);
    return this.getMsUntil(date);
  }

  getMsUntil(date) {
    const tnow = +new Date();
    const tdate = +date;
    const ms = Math.max(tdate - tnow, 0);
    return ms;
  }
}

class UnipotsdamDormZimInternetStatisticsAdapter extends Adapter {
  constructor(addonManager) {
    super(addonManager, 'UnipotsdamDormZimInternetStatisticsAdapter', manifest.id);
    addonManager.addAdapter(this);

    this.db = new Database(this.packageName);
    const _self = this;
    this.db.open().then(() => {
      return _self.db.loadConfig();
    }).then((config) => {
      _self.config = config;
      return Promise.resolve();
    }).then(() => {
      _self.addDevice();
    }).catch(console.error);
  }

  async addDevice() {
    const lib = new UPDormZimInternetLib(this.config.dormId);
    if (!this.config.routerIP || this.config.routerIP=='')
      await lib.getIP();
    else
      lib.ip = this.config.routerIP;
    console.log('router IP', lib.ip);
    const maxdatavolume = await lib.getMaxVolume();
    const device = new UnipotsdamDormZimInternetStatisticsDevice(this, lib, maxdatavolume);
    this.handleDeviceAdded(device);
  }

  startPairing(_timeoutSeconds) {
    console.log('pairing started');
  }

  cancelPairing() {
    console.log('pairing cancelled');
  }

  removeThing(device) {
    console.log('removeThing(', device.id, ')');

    this.handleDeviceRemoved(device);
    this.addDevice();
  }

  cancelRemoveThing(device) {
    console.log('cancelRemoveThing(', device.id, ')');
  }
}

module.exports = UnipotsdamDormZimInternetStatisticsAdapter;
