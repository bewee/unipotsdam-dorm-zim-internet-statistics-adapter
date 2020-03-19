/**
 * index.js - Loads the unipotsdam-dorm-zim-internet-statistics adapter.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const UnipotsdamDormZimInternetStatisticsAdapter = require('./unipotsdam-dorm-zim-internet-statistics-adapter');

module.exports = (addonManager) => {
  new UnipotsdamDormZimInternetStatisticsAdapter(addonManager);
};
