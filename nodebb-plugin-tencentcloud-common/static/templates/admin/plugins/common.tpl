<div class="tencentcloud-plugin">
	<h3>腾讯云插件中心插件</h3>
	<div class="tencentcloud-plugin-content">
		<ul class="tencentcloud-plugin-menu">
			<li class="active" data-tab='1'>腾讯云密钥</li>
			<li data-tab='2'>插件配置中心</li>
		</ul>
		<form class="tencentcloud-plugin-form">
			<div class="checkbox">
			  开启全局密钥
				<label for="isOpen" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
					<input type="checkbox" class="mdl-switch__input" id="isOpen" name="isOpen" />
					<span class="mdl-switch__label">为各个腾讯云插件配置全局通用的腾讯云密钥，简化插件密钥配置工作</span>
				</label>
			</div>
			<div class="form-group">
				<label for="secretId">SecretId</label>
				<input type="password" id="secretId" name="secretId" value="{secretId}" title="SecretId" class="form-control"
						placeholder="输入腾讯云账号SecretId">
				<span class="fa fa-eye eye"></span>
			</div>
			<div class="form-group">
				<label for="secretKey">SecretKey</label>
				<input type="password" id="secretKey" name="secretKey" value="{secretKey}" title="SecretKey" class="form-control"
						placeholder="输入腾讯云账号SecretKey">
				<span class="fa fa-eye eye"></span>
			</div>
			<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
				<i class="material-icons">save</i>
			</button>
		</form>
		<table class="table table-striped tencentcloud-plugin-table">
			<thead>
				<tr>
					<th scope="col">插件名称</th>
					<th scope="col">描述</th>
					<th scope="col">版本</th>
					<th scope="col">状态</th>
					<th scope="col">操作</th>
				</tr>
			</thead>
			<tbody>
				{{{ each installedPlugins }}}
					<tr>
						<th scope="row">{installedPlugins.id}</th>
						<td>{installedPlugins.description}</td>
						<td>{installedPlugins.version}</td>
						<td>{installedPlugins.status}</td>
						<td>
							<span class="table-btn plugin-set-btn" data-id={installedPlugins.id}>{{installedPlugins.buttonText}}</span>
							<span class="table-btn plugin-edit-btn" data-id={installedPlugins.id}>配置<span>
						</td>
					</tr>
				{{{ end }}}
			</tbody>
		</table>
	</div>
</div>

<script>
	$(document).ready(function () {
		// 设置switch开关状态
		var $secretId = $('#secretId'),
			$secretKey = $('#secretKey'),
	  	isOpen = {isOpen};
		if(isOpen) {
			$("label[for='isOpen']").addClass('is-checked');
			$('#isOpen').attr('checked', true);
			$secretId.attr('readonly', false);
			$secretKey.attr('readonly', false);
		} else {
			$("label[for='isOpen']").removeClass('is-checked');
			$('#isOpen').attr('checked', false);
			$secretId.attr('readonly', true);
			$secretKey.attr('readonly', true);
		}

		// tab切换
		$(".tencentcloud-plugin-menu li").on('click', function(e) {
			var activeTab = e.target.dataset.tab;

			$(this).siblings().removeClass('active');
			$(this).addClass("active");

			if(activeTab === '1') {
				$('.tencentcloud-plugin-form').show();
				$('.tencentcloud-plugin-table').hide();
			} else {
				$('.tencentcloud-plugin-form').hide();
				$('.tencentcloud-plugin-table').show();
			}
		})

		// 密钥开关切换
		$("#isOpen").on('change', function(e) {
			if(e.target.checked) {
				$secretId.attr('readonly', false);
				$secretKey.attr('readonly', false);
			} else {
				$secretId.attr('readonly', true);
				$secretKey.attr('readonly', true);
			}
		})

		// 输入框type变化
		$(".eye").on('click', function(e) {
			var $prev = $(this).prev();
			if($prev.attr('type') === 'password') {
				$prev.attr('type', 'text');
				$(this).removeClass('fa-eye').addClass('fa-eye-slash');
			} else {
				$prev.attr('type', 'password');
				$(this).removeClass('fa-eye-slash').addClass('fa-eye');
			}
		})

		// 腾讯云基本配置保存
		$('#save').on('click', function (e) {
			e.preventDefault();
			var data = {
				_csrf: '{csrf}'
			};
			var values = $('.tencentcloud-plugin-form').serializeArray();
			
			for (var i = 0, l = values.length; i < l; i++) {
				data[values[i].name] = values[i].value;
			}
			if(data.isOpen === 'on') {
				data.isOpen = true;
			} else {
				data.isOpen = false;
			}
			if(!data.secretId.trim() || !data.secretKey.trim()) {
				app.alertError('SecretId、SecretKey必填!');
				return false;
			}
			$.ajax({
        type: "POST",
        url: "{forumPath}api/admin/plugins/tencentcloud-common/saveConfig",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (response) {
					ajaxify.refresh();
					app.alertSuccess(response);
        },
        error: function (error) {
					app.alertError('保存失败!');
        }
    	});
		});

		// 激活或停用插件
		$('.plugin-set-btn').on('click', function (e) {
			e.preventDefault();
			var data = {
				_csrf: '{csrf}',
				id: e.target.dataset.id
			}
			$.ajax({
        type: "POST",
        url: "{forumPath}api/admin/plugins/tencentcloud-common/setPluginStatus",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (response) {
					ajaxify.refresh(function() {
						$('.tencentcloud-plugin-menu li:first').removeClass('active');
						$('.tencentcloud-plugin-menu li:last').addClass('active');
						$('.tencentcloud-plugin-form').hide();
						$('.tencentcloud-plugin-table').show();
					});
					
					app.alertSuccess(response);
        },
        error: function (error) {
					app.alertError('设置失败!');
        }
    	});
		})

		// 配置插件
		$('.plugin-edit-btn').on('click', function (e) {
			e.preventDefault();
			var id = e.target.dataset.id;
			var str = id.replace('nodebb-plugin-', '');
			
			location.href = '{forumPath}/admin/plugins/tencentcloud-common/' + str;
		})
	});
</script>


