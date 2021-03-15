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
const commonController = require('./commonController');
const imsController = require('./imsController');

const Plugin = {};
Plugin.init = async (params) => {
  const { router } = params;
  const hostMiddleware = params.middleware;
  // 我们需要为每个视图创建路由。 一个 API 路由，以及它自身的路由。 方法可以参考下面的方案
  // 使用 buildHeader 中间件， NodeBB会构建页面，并将你的模板嵌入进去
  const routes = {
    adminRoute: '/admin/plugins/tencentcloud-common',
    imsRoute: '/admin/plugins/tencentcloud-common/tencentcloud-ims'
  };
  // 腾讯云插件中心插件页面
  router.get(
    routes.adminRoute,
    hostMiddleware.applyCSRF,
    hostMiddleware.admin.buildHeader,
    commonController.renderAdmin
  );
  router.get(`/api${routes.adminRoute}`, hostMiddleware.applyCSRF, commonController.renderAdmin);
  router.post(`/api${routes.adminRoute}/saveConfig`, commonController.saveConfig);
  router.post(`/api${routes.adminRoute}/setPluginStatus`, commonController.setPluginStatus);
  // 腾讯云ims插件页面
  router.get(routes.imsRoute, hostMiddleware.applyCSRF, hostMiddleware.admin.buildHeader, imsController.renderAdmin);
  router.get(`/api${routes.imsRoute}`, hostMiddleware.applyCSRF, imsController.renderAdmin);
  router.post(`/api${routes.imsRoute}/saveConfig`, imsController.saveConfig);

  return params;
};

Plugin.addAdminNavigation = async (header) => {
  header.plugins.push({
    route: '/plugins/tencentcloud-common',
    icon: 'fa-tint',
    name: '腾讯云插件'
  });

  return header;
};

module.exports = Plugin;
