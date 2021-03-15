<div class="tencentcloud-plugin">
	<h3>腾讯云图片内容安全插件</h3>
	<div class="tencentcloud-plugin-content">
		<form class="tencentcloud-plugin-form">
			<div class="checkbox">
			  自定义密钥
				<label for="isOpen" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
					<input type="checkbox" class="mdl-switch__input" id="isOpen" name="isOpen" />
					<span class="mdl-switch__label">为该插件配置单独定义的腾讯云密钥</span>
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
        url: "{forumPath}api/admin/plugins/tencentcloud-common/tencentcloud-ims/saveConfig",
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
	});
</script>


