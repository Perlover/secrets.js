secrets.setRNG(null, false);
var pw = 'PassGuardian';

function error(location, message, hide){
	$($(location).parent()).before('<div class="alert alert-error fade in popupError"><button type="button" class="close" data-dismiss="alert">&times;</button><h4>Error</h4>'+message+'</div>')
	if(hide){
		$(hide).hide();
	}
}
$(document).on('click', '#splitButton', function(ev){
	if(secrets.getConfig().bits !== 8){
		secrets.init(8);
	}
	$('#split-tab .popupError').remove();
	
	var string = $('#string').val();
	if(string === ''){
		return error(this, 'Input cannot be empty.', '#split-result')
	}
	var type = $('.inputType.active').attr('data-inputType');
	var numShares = $('#numShares').val() * 1;
	if(typeof numShares !== 'number' || isNaN(numShares) || numShares < 2 || numShares > 255){
		return error(this, 'Number of shares must be an integer between 2 and 255, inclusive.', '#split-result')
	}
	var threshold = $('#threshold').val() * 1;
	if(typeof threshold !== 'number' || isNaN(threshold) || threshold < 2 || threshold > 255){
		return error(this, 'Threshold must be an integer between 2 and 255, inclusive.', '#split-result')
	}
	
	if(type==='text'){
		string = secrets.str2hex(string);
	}
	if(!$('#shares').length){
		$(this).parent().after('<div id="split-result" style="display:none;" class="alert alert-block alert-success fade in"><button type="button" class="close" data-dismiss="alert">&times;</button><h4>Secret shares</h4>One share per line<pre id="shares"></pre></div>');
	}
	try{
		var shares = secrets.share(string, numShares, threshold);
		var textarea = $('#shares');
		shares = shares.join('<br>');
		textarea.html(shares);
		$('#split-result').show();
		secrets.getConfig().unsafePRNG ? $('#PRNGwarning').show() : $('#PRNGwarning').hide();
		numShares<threshold ? $('#mismatchWarning').show() : $('#mismatchWarning').hide();
	}catch(e){
		return error(this, e, '#split-result')
	}	
})

$(document).on('click', '#reconButton', function(ev){
	$('#recon-tab .popupError').remove();
	var shares = [];
	$('.shareInput').each(function(){
		var share = $.trim($(this).val());
		if(share){
			shares.push(share);
		}else if($('.shareInput').length >= 3){
			$(this).remove();
		}
	})
	if(shares.length<2){
		return error(this, 'Enter at least 2 shares.', '#recon-result')
	}
	var type = $('.reconType.active').attr('data-inputType');
	
	if(!$('#reconstruction').length){
		$(this).parent().after('<div id="recon-result" style="display:none;" class="alert alert-block alert-success fade in"><button type="button" class="close" data-dismiss="alert">&times;</button><h4>Reconstructed secret</h4><pre id="reconstruction"></pre></div>');
	}
	try{
		var recon = secrets.combine(shares);
		if(type === 'text'){
			recon = secrets.hex2str(recon);
		}
		$('#reconstruction').text(recon);
		$('#recon-result').show();
	}catch(e){
		return error(this, 'Reconstruction ' + e, '#recon-result')
	}
})

$(document).on('click', '#addShareButton', function(ev){
	$('#inputShares').append('<input type="text" class="input-block-level shareInput" placeholder="Enter one share">')
})

$(document).on('click','#clearButton', function(ev){
	$('#string').val('');
})

$(document).on('click','#clearAllButton', function(ev){
	$('.shareInput').each(function(){
		$(this).val('');
	})
})

$(document).on('click','.inputType[data-inputType=hex]', function(ev){
	var string = $('#string');
	var val = string.val().replace(/\n/g,' ');
	if(string.is('textarea')){
		string.replaceWith('<input class="input-block-level" id="string" type="text" placeholder="Secret to share" value="'+val+'">')
	}
})
$(document).on('click','.inputType[data-inputType=text]', function(ev){
	var string = $('#string');
	var val = string.val();
	if(!string.is('textarea')){
		string.replaceWith('<textarea class="input-block-level" id="string" type="text" rows="3" placeholder="Secret to share">'+val+'</textarea>')
	}
})

$(document).on('click','#resetSplitForm', function(ev){
	$('#split-tab .popupError').remove();
	var string = $('#string').val('');
	if(!string.is('textarea')){
		string.replaceWith('<textarea class="input-block-level" id="string" type="text" rows="3" placeholder="Secret to share"></textarea>')
	}
	$('#numShares').val(2);
	$('#threshold').val(2);
	var activeType = $('.inputType.active');
	if(!activeType.attr('text')){
		activeType.removeClass('active');
		$('.inputType[data-inputType=text]').addClass('active')
	}
	$('#split-result').hide();
	$('#shares').empty();
})

$(document).on('click','#resetReconForm', function(ev){
	$('#recon-tab .popupError').remove();
	$('.shareInput').each(function(){
		if($('.shareInput').length >=3 ){
			$(this).remove()
		}else{
			$(this).val('');
		}
	})
	$('#string').val('');
	$('#numShares').val(2);
	$('#threshold').val(2);
	var activeType = $('.reconType.active');
	if(!activeType.attr('text')){
		activeType.removeClass('active');
		$('.reconType[data-inputType=text]').addClass('active')
	}
	$('#recon-result').hide();
	$('#reconstruction').empty();
	$('#recon-hmac').empty();
})