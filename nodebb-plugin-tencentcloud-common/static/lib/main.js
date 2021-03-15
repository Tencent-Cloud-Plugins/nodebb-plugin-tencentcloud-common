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

/* globals document, $ */

$(document).ready(function () {
  /*
		这个文件告诉我们：如何引入一个客户端 js 脚本
		在 `plugin.json` 中，你可以发现本文件列在 "scripts" 字段中。
		那个数组的意义是告知 NodeBB 构建时，需要引入并优化的客户端 js 脚本。

		这些方法你很可能会用到：

		$(document).ready();	  当 DOM 加载完毕时会触发。
		$(window).on('action:ajaxify.end', function(data) { ... });		注："data" 包含 "url" 
		Ajax 请求完成后触发，更明确的表述： Ajax操作完成， 并切换路由后触发。
	*/

  console.log('nodebb-plugin-tencent-common: loaded');
  // 注意：这个会在着陆页触发。
});
