/*
 * Copyright (C) 2020 Tencent Cloud.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
const crypto = require('crypto');
const winston = require.main.require('winston');
const db = require.main.require('./src/database');
const report = require('./report');

/**
 * 获取腾讯云API签名方法V3
 * @param {string} servicename - 服务名称，例如：ims等
 * @param {string} payload - 接口请求正文
 * @return {string[]} 返回API请求接口headers所需要的认证信息
 */
async function sign(servicename, payload) {
  const { secretId, secretKey } = await getSecretId(servicename);
  // 配置校验
  if (!secretId || !secretKey) {
    throw new Error('请配置腾讯云密钥!');
  }
  if (!servicename) {
    throw new Error('请填写服务名称');
  }
  const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
  const requestString = `POST\n/\n\ncontent-type:application/json\nhost:${servicename}.tencentcloudapi.com\n\ncontent-type;host\n${payloadHash}`;
  const currentDate = new Date();
  const timestamp = `${Math.floor(currentDate.getTime() / 1000)}`;
  const dateString = currentDate.toISOString().substr(0, 10);
  const requestStringHash = crypto.createHash('sha256').update(requestString).digest('hex');
  const stringToSign = `TC3-HMAC-SHA256\n${timestamp}\n${dateString}/${servicename}/tc3_request\n${requestStringHash}`;
  const secretDate = crypto.createHmac('sha256', `TC3${secretKey}`).update(dateString).digest();
  const secretService = crypto.createHmac('sha256', secretDate).update(servicename).digest();
  const secretSigning = crypto.createHmac('sha256', secretService).update('tc3_request').digest();
  const signature = crypto.createHmac('sha256', secretSigning).update(stringToSign).digest('hex');
  return [
    timestamp,
    `TC3-HMAC-SHA256 Credential=${secretId}/${dateString}/${servicename}/tc3_request, SignedHeaders=content-type;host, Signature=${signature}`
  ];
}

/**
 * 插件使用统计，异步处理，忽略结果，不阻塞主流程,上报到小马BI
 * @param {string} module - 模块名称，例如：ims等
 * @param {object} extraInfo - 附加信息
 */
async function reportToBI(module, extraInfo) {
  const { secretId, secretKey } = await getSecretId(module);

  report({
    secretId,
    secretKey,
    module,
    extraInfo
  });
}

/**
 * 获取密钥
 * @param {string} servicename - 服务名
 * @return {object} 密钥信息
 */
async function getSecretId(servicename) {
  let secretId;
  let secretKey;
  const pluginConfig = await db.getObject(`tencentcloud-${servicename}`);
  const commonConfig = await db.getObject('tencentcloud-common');
  if (pluginConfig && pluginConfig.isOpen) {
    secretId = pluginConfig.secretId;
    secretKey = pluginConfig.secretKey;
  } else if (commonConfig && commonConfig.isOpen) {
    secretId = commonConfig.secretId;
    secretKey = commonConfig.secretKey;
  }
  return {
    secretId,
    secretKey
  };
}

/**
 * 错误处理函数
 * @param {string} pluginName 当前插件名
 * @param {object | string} err 错误信息
 * @return {object} err 错误信息
 */
function handleError(pluginName, err) {
  if (err instanceof Error) {
    err.message = `${pluginName} :: ${err.message}`;
  } else {
    err = new Error(`${pluginName} :: ${err}`);
  }

  winston.error(err.message);
  return err;
}

/**
 * 获取并设置各模块配置信息
 * @param {string} pluginName - 插件名
 * @param {object} config - 获取的对象
 */
async function fetchConfig(pluginName, config) {
  const newConfig = await db.getObjectFields(pluginName, Object.keys(config));
  for (const i in newConfig) {
    if (newConfig[i] !== null) {
      config[i] = newConfig[i];
    }
  }
}

/**
 * 保存插件配置到数据库
 * @param {string} pluginName - 插件名
 * @param {object} config - 获取的对象
 */
async function saveConfig(pluginName, config) {
  try {
    await db.setObject(pluginName, config);
  } catch (error) {
    throw handleError(error);
  }
}

module.exports = { sign, reportToBI, handleError, fetchConfig, saveConfig };
