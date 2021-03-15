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
const Plugins = require.main.require('./src/plugins');
const nconf = require.main.require('nconf');
const db = require.main.require('./src/database');
const { handleError, fetchConfig, saveConfig } = require('./common');

// 公共模块控制器
const Controller = {
  pluginName: 'tencentcloud-common', // 当前插件名
  installedPlugins: [], // 当前站点安装的腾讯云插件
  config: {
    // 当前插件配置数据
    isOpen: true,
    secretId: '',
    secretKey: ''
  }
};

// 获取安装的腾讯云插件
Controller.getInstalledPlugins = async () => {
  try {
    Controller.installedPlugins = await Plugins.showInstalled();
  } catch (error) {
    throw handleError(error);
  }

  Controller.installedPlugins = Controller.installedPlugins.filter((item) => {
    item.status = item.active ? '已启用' : '已停用';
    item.buttonText = !item.active ? '启用' : '停用';
    return item.id && item.id.includes('tencentcloud') && !item.id.includes('tencentcloud-common');
  });
};

// 渲染配置页
Controller.renderAdmin = async (req, res) => {
  let forumPath = nconf.get('url');
  if (forumPath.split('').reverse()[0] !== '/') {
    forumPath = `${forumPath}/`;
  }

  await Controller.getInstalledPlugins();
  await fetchConfig(Controller.pluginName, Controller.config);
  const data = {
    csrf: req.csrfToken(),
    isOpen: Controller.config.isOpen,
    secretId: Controller.config.secretId,
    secretKey: Controller.config.secretKey,
    forumPath,
    installedPlugins: Controller.installedPlugins
  };

  res.render('admin/plugins/common', data);
};

// 保存腾讯云基础配置
Controller.saveConfig = async (req, res, next) => {
  const data = req.body;
  const newConfig = {
    isOpen: data.isOpen,
    secretId: data.secretId,
    secretKey: data.secretKey
  };

  await saveConfig(Controller.pluginName, newConfig);
  res.json('配置已保存!');
};

// 激活或禁用腾讯云插件
Controller.setPluginStatus = async (req, res, next) => {
  const pluginId = req.body.id;
  let message = '';

  try {
    const result = await Plugins.toggleActive(pluginId);
    message = result.active ? '插件已激活' : '插件已停用';
    res.json(message);
  } catch (error) {
    throw handleError(error);
  }
};

module.exports = Controller;
