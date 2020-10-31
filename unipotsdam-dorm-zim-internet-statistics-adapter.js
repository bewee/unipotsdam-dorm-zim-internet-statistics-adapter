'use strict';

const Adapter = require('gateway-addon').Adapter;
const Database = require('gateway-addon').Database;
const Device = require('gateway-addon').Device;
const Property = require('gateway-addon').Property;
const manifest = require('./manifest.json');
const UPDormZimInternetLib = require('./up-dorm-zim-internet-lib');

class UnipotsdamDormZimInternetStatisticsDevice extends Device {
  constructor(adapter, lib, maxdatavolume) {
    super(adapter, 'unipotsdam-dorm-zim-internet-statistics');

    this.lib = lib;
    this.maxdatavolume = maxdatavolume;

    this.name = 'Internet statistics';
    this['@type'] = ['MultiLevelSensor'];
    this.description = 'Internet statistics';

    this.usedProperty = new Property(this, 'used', {
      '@type': 'LevelProperty',
      label: 'used data volume (GB)',
      name: 'used',
      type: 'number',
      minimum: 0,
      maximum: maxdatavolume/1024.0,
      value: 0,
      multipleOf: 1/100.0,
      readOnly: true,
    });
    this.properties.set('used', this.usedProperty);
    this.remainingDaysProperty = new Property(this, 'remainingDays', {
      label: 'days remaining',
      name: 'remainingDays',
      type: 'integer',
      value: 0,
      readOnly: true,
    });
    this.properties.set('remainingDays', this.remainingDaysProperty);

    this.links.push({
      rel: 'alternate',
      mediaType: 'text/html',
      href: `https://www.intern.uni-potsdam.de/zim/psn/${this.adapter.config.dormId}`,
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
    this.db.open().then((() => {
      return this.db.loadConfig();
    }).bind(this)).then(((config) => {
      this.config = config;
      return Promise.resolve();
    }).bind(this)).then((() => {
      this.addDevice();
    }).bind(this)).catch(console.error);
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
