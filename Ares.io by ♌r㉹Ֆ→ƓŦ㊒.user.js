// ==UserScript==
// @name         Ares.io by ♌r㉹Ֆ→ƓŦ㊒
// @namespace    http://tampermonkey.net/
// @version      0.1
// @updateURL   http://ogario.ovh/download/OGARio.chrome.en.user.js
// @description  Lets be Better
// @author       Ares
// @match        http://agar.io/*
// @grant        none
// ==/UserScript==

(function() {    
	var lastEdit = 1465120103810;
	var profileOptions = {};
	var loopCount = 0;
	var overlaysOpened = true;
	var gameLoaded = false, coinFirstClick = false;	
	var keysHold = {}, ejectorLoop = null;
	var canvas = document.getElementById('canvas');
	var canvas2 = document.getElementById('openfl-content').getElementsByTagName('canvas')[0];

	$(document).ready(function() {
		window.onbeforeunload = function() { return 'Quit game?'; };
		$(document).ajaxComplete(function(e, xhr, stg) {
			if(stg.url.indexOf('findServer') != -1 && xhr.status == 200) {
				if(gameLoaded) setTimeout(onRoomLoad, 800);
				else setTimeout(onGameLoad, 1800);
				gameLoaded = true;
			}
		});
		editOverlays();
		hookOverlays();
		hookKeys();
	});
    function editOverlays() {
 		[ 'settings', 'scale_setting', 'quality_setting', 'location' ].forEach(function(e) { localStorage.removeItem(e); });
		$('button[data-itr="play"]').css({'width': '230px'});
		$('button[data-itr="play_as_guest"]').css({'width': '112px'});
		$('button[data-itr="login_and_play"]').css({'width': '112px'}).after('<button id="joinNewRoom" title="Join new room" style="width: 40px; display: block; float: right;" class="btn btn-success btn-refresh"><i class="glyphicon glyphicon-refresh"></i></button>');


		$('#settings').before('<hr style="margin-top: 10px; margin-bottom: 10px;">');
		$('#options').css({ 'margin-top': '16px' })
			.append('<div>Action on room join:<select id="optnOnJoin" style="margin: 0px 6px"><option value="">Do nothing</option><option value="spawn">Spawn</option><option value="spec">Join spectator</option></select></div>')
			.append('<div><label><input id="optnSpawn" type="checkbox">Auto respawn</label></div>')
			.append('<div><label><input id="optnCoin" type="checkbox">Click coin every</label><input id="optnCoin_Interval" type="number" min="1" value="15" disabled="disabled" style="margin: 0px 6px; width: 50px;"><span>min</span></div>')
			.append('<div><label><input id="optnMove" type="checkbox">Randomized movement every</label><input id="optnMove_Interval" type="number" min="1" value="5" disabled="disabled" style="margin: 0px 6px; width: 50px;"><span>sec</span></div>');

		var addedOptions = $('#options div');
		for(var i = 0; i < addedOptions.length; i++) {
			addedOptions.eq(i).css({ 'width': '282px', 'margin': '2px 0px' });
			if(i === 0) addedOptions.eq(i).css({ 'border-top': '1px dashed', 'margin-top': '10px', 'padding-top': '10px' });
		}

		$('#instructions')
			.html('<div style="text-align: center;"><strong>Instructions</strong>Move your mouse to control your cell<br>Press <b>Space</b> to split<br>Press <b>W</b> to eject some mass</div><hr style="margin: 10px 0px;">')
			.append('<div><strong>Ingame Shortcuts / Macros</strong><span><b>E</b> Shoot mass cont.</span><span><b>Z</b>Spam Split</span><span><b>S</b> Stop movement</span></div>')
			.after('<div class="modInfo-toggler" style="font-size: 75%; float: right; margin-bottom: 6px !important;">Mod by Ares. <a href="#">More Info</a></div>');
		$('#instructions div').css({ 'color': '#555', 'padding': '0px 10px', 'font-size': '12px', 'margin': '12px 0px' });
		$('#instructions strong').css({ 'color': '#333', 'display': 'block', 'margin-bottom': '6px', 'text-align': 'center', 'font-size': '16px' });
		$('#instructions b').css({ 'background-color': '#333', 'color': '#EEE', 'padding': '1px 5px', 'border-radius': '3px', 'min-width': '20px', 'display': 'inline-block', 'margin': '1px 0px', 'text-align': 'center' });
		$('#instructions span').css({ 'display': 'inline-block', 'width': '150px' });

		$('footer.tosBox.left').removeClass('left').addClass('gamemodes').css({ 'position': 'absolute', 'bottom': '32px', 'right': '0px', 'font-size': '12px', 'background-color': '#3071A9', 'border-radius': '15px 0px 0px 15px', 'padding-left': '18px' });
		$('footer.tosBox.right').removeClass('right').addClass('tos').css({ 'position': 'absolute', 'bottom': '2px', 'right': '0px', 'font-size': '12px', 'background-color': '#3071A9', 'border-radius': '15px 0px 0px 15px', 'padding-left': '18px' })
			.after('<footer class="donate" style="position: absolute; bottom: -2px; right: 380px;"><form id="donate-mod" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank"><input type="hidden" name="cmd" value="_donations"><input type="hidden"name="business" value="keyzint@gmail.com"><input type="hidden" name="lc" value="US"><input type="hidden" name="item_name" value="Donation"><input type="hidden" name"no_not" value="0"><input type="hidden" name="currency_code" value="USD"><input type="hidden" name="bn" value="PP-DonationsBF:btn_donateCC_LG.gif:NonHostedGuest"><input type="image" style="height: 24px;" name="submit" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" alt="PayPal button" border="0"></footer>')
			.after('<footer class="tosBox homepage" style="position: absolute; bottom: 0px; right: 280px; background-color: #398439; border-radius: 5px 5px 0px 0px;"><a href="https://greasyfork.org/en/scripts/14297-agar-io-auto-respawn-evergreen" target="_blank">Homepage</a></footer>');
		$('footer a').css('color', '#FFF');
		appendGoogleAd();
		setInterval(appendGoogleAd, 90000);

		$('footer').eq(0).before('<div id="toolTip" style="position: absolute; display: none; transform: translate(-50%, -100%); background-color: #222; color: #EEE; text-align: center; padding: 2px 6px; border-radius: 3px;"></div><div id="modInfo"><div id="modInfo-header"><button class="modInfo-toggler">&#x2716;</button><h2>Script Info</h2><span title="' + Date(lastEdit).toString() + '">Last update: ' + timeSince(lastEdit) + ' ago</span></div><div id="modInfo-content"></div><div id="modInfo-footer"></div></div>');
		$('#modInfo').css({ 'display': 'none', 'width': '820px', 'height': '500px', 'padding': '0px 20px', 'position': 'absolute', 'top': '50%', 'left': '50%', 'transform': 'translate(-50%, -50%)', 'background-color': '#123', 'color': '#AAA', 'border': '1px solid #000000', 'border-radius': '12px', 'box-shadow': '0px 0px 100px #012 inset' });
		$('#modInfo-header').css({ 'font-family': 'Consolas', 'color': '#EEE', 'padding': '20px 0px', 'text-align': 'center', 'border-bottom': '2px solid #28B', 'position': 'relative' });
		$('#modInfo-header button').css({ 'float': 'right', 'color': '#AAA', 'border': 'none', 'background-color': 'rgba(0, 0, 0, 0.3)', 'position': 'absolute', 'top': '10', 'right': '0' });
		$('#modInfo-header h2').css({ 'margin': '0px' });
		$('#modInfo-header span').css({ 'font-size': '80%', 'color': '#999' });
		$('#modInfo-content').css({ 'font-family': 'Tahoma, sans-serif', 'width': '780px', 'height': '338px', 'overflow': 'auto', 'margin': '20px 0px' });
		$('#modInfo-footer').css({ 'font-size': '80%' });
		$('#modInfo-content').html('<div id="modInfo-content-features"><span style="color: #EEE;">Features</span><ul><li>Auto-save game settings<ul><li>Settings are saved automatically every time you makeachange.</li><li>Default name is ௌௌௌௌௌௌௌௌௌௌௌௌௌௌௌ</li></ul></li><li>Auto respawn - Enabling this will also make the Score counter to show real-time mass.</li><li>Spectator Mode - Enabling this will put you into spectator mode when you join a server.</li><li>Randomize Movement - Enabling this will make your cells change direction randomly every 5 seconds. Useful when going AFK.</li><li>Acid Mode</li><li>Refresh server button</li><li>Confirm dialog on tab close</li><li>Confirm dialog on logout</li><li>Hide ads and promos</li><li>Various ingame keyboard shortcuts</li></ul></div>\
<div id="modInfo-content-changelogs"><span style="color: #EEE;">Changelog</span> <a href="#" class="modInfoChangelog-toggler" style="font-size: 11px;">Show</a><div style="display: none; width: 90%; background: rgba(0,0,0,0.3); font-size: 11px; padding: 10px"><ul style="padding-left: 20px;">\
<li>2016-06-22 - Profile buttons now diplay region, game mode and name when you hover over them</li><li>2016-06-04<ul><li>Fixed pressing "login to play" button making overlay close if you have autospawn enabled<li>You will also click coin when you start the game if you have the autoclick coin enabled<li>Added delay before applying profile settings just to be safe</ul></li><li>2016-06-03 - Rewrote most of the codes</li><li>2016-05-27<ul><li>Changed source code location</li><li>Added auto-click hourly coin feature</li><li>Auto movement and autoclick coin interval now can be set</li></ul></li><li>2016-05-24 - Fixed broken stop moving and random moving function. The \'go to map center\' function is still broken though.</li><li>2016-05-23<ul><li>Opening free coins panel will automatically clicks the get coins button<li>Replaced promo banner with google ads banner</ul></li><li>2016-04-20 - Added profiles - you can save 10 different profiles each with their own settings</li><li>2016-04-06 - Changed leaderboard text to show what mode it currently is</li><li>2016-03-23<ul><li>Added confirm box on clicking log out button<li>Refresh server button now also works in party mode</li></li></ul></li><li>2016-03-01<ul><li>Made all panels opened with the ingame shortcut to be semi-transparent</li><li>Added new feature - Press , to open free coin panel</li><li>Added new feature - Spectator Mode - You will be put into spectatormode when you join a server</li></ul></li>\
<li>2015-02-19<ul><li>Added new feature - Press V to open skin panel</li><li>Added new feature - Press B to open shop panel</li><li>Added new feature - Press M to open mass boost panel</li><li>Added new feature - Press N to open xp panel</li><li>Removed checkboxes for ingame shortcut features - they are now not toggle-able</li><li>Reworked instruction UI</li></ul></li><li>2015-12-29<ul><li>Added new feature - Press R to eject mass 7 times</li><li>Added new fature - Press T to split 4 times</li></ul></li><li>2015-12-26<ul><li>Moved connecting panel to top right corner of the screen</li><li>Added region and gamemode info on connecting panel</li></ul></li><li>2015-12-24 - Added new feature - Acid mode</li><li>2015-12-23 - Resized stats panel to exclude ads height</li>\
<li>2015-12-22<ul><li>Added new feature - Press S key to stop movement</li><li>Added new feature - Press C to go to the center of the map</li><li>Added new feature - Randomize movement - change direction every 5 seconds</li></ul></li><li>2015-12-18 - Added changelog into the info panel</li><li>2015-12-16 - Added info panel</li><li>2015-12-13 - Fixed gamemode not always changing to the saved value</li><li>2015-12-11 - Fixed not being able to spectate</li><li>2015-12-09 - Script is now hosted on pastebin to make updating easy</li><li>2015-12-08<ul><li>Fixed overlay not displayed on center y-axis</li><li>Updated link for update script url</li><li>Added donate button in the footer</li></ul></li>\
<li>2015-12-06<ul><li>Added promo hiding</li><li>Stylized footer and moved it to the right</li></ul></li><li>2015-12-05<ul><li>Rewrote code to use jQuery</li><li>Fixed auto spawn not working for guest players</li><li>Added ads hiding feature</li><li>Added instruction for "hold E to W"</li><li>Added link to this page</li><li>Stylized instructions a little bit</li></ul></li><li>2015-12-02 - Added refresh server button</li><li>2015-12-01<ul><li>Fixed button style on chrome</li><li>Added "hold E to W" function</li><li>Removed debugging alert message</li></ul></li><li>2015-11-30 - Fixed auto spawn checkbox not working</li><li>2015-11-29 - Initial release</li></ul></div></div>');
		$('#modInfo-footer').html('<a href="https://greasyfork.org/en/scripts/14297-agar-io-auto-respawn-evergreen" target="_blank">Homepage</a> - <a href="https://greasyfork.org/scripts/20003-agar-io-auto-respawn-code/code/Agario%20auto%20respawn%20code.js" target="_blank">Source Code</a> - <a href="#" onclick="$(\'#donate-mod input[name=submit]\').click(); return false;">Donate</a>');

		$('#advertisement').hide().css({ 'visibility': 'hidden' });
		$('#agario-web-incentive a, .agario-promo a').remove();
		$('#region').val('').css({ 'display': 'block' });
		//$('#stats').css('height', '375px');
		//$('#stats hr').remove();
		//$('#socialStats').css('bottom', '65px');
		//$('#statsContinue').css('bottom', '25px');
		//$('#statsGraph').css({ 'bottom': '110px', 'opacity': '1' }).attr('height', '200px');
		//$('#s300x250').css({ 'display': 'none', 'z-index': '-10' });
		setTimeout(function() { $('#___ytsubscribe_0').css({'width': '112px'});}, 12000);
	}

	function hookOverlays() {
		$('#freeCoins').on('click', function() { getCoin(); });
		$('button[data-itr="play"]').on('click', function() { overlaysOpened = false; });
		$('button[data-itr="play_as_guest"]').on('click', function() { overlaysOpened = false; });
		$('button[data-itr="spectate"]').on('click', function() { overlaysOpened = true; });
		$('button[data-itr="logout"]').removeAttr('onclick').on('click', function() { var lg = confirm('Logout?'); if(lg) logout(); });
		$('#joinNewRoom').on('click', function() {
			var q = $('#gamemode').val();
			if(q == ':party') $('button[data-itr="create_party"]').click();
			else {
				$('#gamemode').val(':party').change();
				$('#gamemode').val(q).change();
			}
		});
		$('#profiles button').on('mouseover', function(e) { $('#toolTip').html($(this).attr('data-title')).css({ 'display': 'block', 'top': e.clientY - 20, 'left': e.clientX }); });
		$('#profiles button').on('mouseout', function(e) { $('#toolTip').css({ 'display': 'none' }); });
		$('.modInfo-toggler').on('click', function(e) { $('#modInfo').fadeToggle(); e.preventDefault(); });
		$('.modInfoChangelog-toggler').on('click', function(e) { $(this).next().slideToggle(); e.preventDefault(); });
		$.each(['show', 'hide'], function (i, ev) { var el = $.fn[ev]; $.fn[ev] = function () { this.trigger(ev); return el.apply(this, arguments); }; });
		$('#openfl-content').on('hide', function() {
			setTimeout(function() {
				$('#openfl-content').css({'opacity' : '1'});
				$('#openfl-overlay').css({'pointer-events' : ''});
			}, 10);
		});
	}

	function onGameLoad() {
		handleOptions();
		setInterval(logicLoop, 1000);
		if(localStorage.getItem('activeProfile') === null) localStorage.setItem('activeProfile', 0);
		$('#profiles button').eq(localStorage.getItem('activeProfile')).click();
		updateProfileTitle();
	}
	function onRoomLoad() {
		if(profileOptions.optnOnJoin == 'spawn') $('button[data-itr="play"]').click();
		else if(profileOptions.optnOnJoin == 'spec') $('button[data-itr="spectate"]').click();
	}

	function updateProfileTitle(p) {
		var n, m;
		if(p === undefined) { n = 0; m = 10; }
		else { n = p; m = p; }
		for(i = n; i <= m; i++) {
			var temp = JSON.parse(localStorage.getItem('rprofile' + i));
			if(temp === null) $('#profiles button').eq(i).attr('data-title', 'Empty profile');
			else {
				var x, y, z = temp.nick;
				$('#region option').each(function(e) { if($(this).val() == temp.region) x = $(this).text().split(' (')[0]; });
				$('#gamemode option').each(function(e) { if($(this).val() == temp.gamemode) y = '<span style="font-weight: bold; color: ' + (e == 0 ? '#3F3' : e == 1 ? '#3AF' : e == 2 ? '#F33' : '#A3F') + ';">' + $(this).text() + '</span>'; });
				$('#profiles button').eq(i).attr('data-title', x + ' - ' + y + '<br>' + z);
			}
		}
	}

	function logicLoop() {
		loopCount++;
		$('button[data-itr="spectate"]').removeAttr('disabled');
		if(profileOptions.optnSpawn && !overlaysOpened) MC.setNick($('#nick').val());
		if(profileOptions.optnCoin && loopCount % (parseInt($('#optnCoin_Interval').val()) * 60) === 0) showPanel(5);
		if(profileOptions.optnMove && loopCount % parseInt($('#optnMove_Interval').val()) === 0) simulateMove(Math.random() * innerWidth, Math.random() * innerHeight, canvas);
		if(!coinFirstClick) {
			if(profileOptions.optnCoin && $('#coins-blocker').css('display') == 'none') {
				coinFirstClick = true;
				setTimeout(function() { showPanel(5); }, 1600);
			}
		}
	}

	function hookKeys() {
		$(document).on('keyup', function(e) {
			var key = e.which || e.keyCode;
			keysHold[key] = false;
			if(key == 69) { // key E
				clearInterval(ejectorLoop);
				ejectorLoop = null;
			}
		});

		$(document).on('keydown', function(e) {
			var key = e.which || e.keyCode;
			var spKeys = e.ctrlKey || e.altKey || e.shiftKey;
			//console.log('keydown ' + key);
			if($('#overlays').is(':hidden') && !spKeys) {
				if(key == 27) overlaysOpened = true; // key ESC
				if(!keysHold[key]) {
					if(key == 69) { // key E
						if(!ejectorLoop) {
							ejectorLoop = setInterval(function() {
								window.onkeydown({ keyCode: 87 });
								window.onkeyup({ keyCode: 87 });
							}, 10);
						}
					}
					else if(key == 82) { // key R
						setIntervalX(function() {
							window.onkeydown({ keyCode: 87 }); // key W
							window.onkeyup({ keyCode: 87 });
						}, 120, 7);
					}
					else if(key == 90) { // key Z
						setIntervalX(function() {
							window.onkeydown({ keyCode: 32 });  // key SPACE
							window.onkeyup({ keyCode: 32 });
						}, 60, 4);
					}
					else if(key == 83) { // key S // todo - this is not working in chrome
						var mEv = new MouseEvent('mousemove', {'clientX': window.innerWidth/2, 'clientY': window.innerHeight/2});
						canvas.dispatchEvent(mEv);
					}
					
				}
				keysHold[key] = true;
			}
		});
	}

	function handleOptions() {
		var profiles = $('#profiles button');
		var checkboxes = $('#options input[type="checkbox"]');
		var textfields = $('#nick, #gamemode, #region, #quality, #optnOnJoin, #optnCoin_Interval, #optnMove_Interval');

		checkboxes.on('change', function() {
			var optnID = $(this).attr('id');
			var optnEnabled = $(this).is(':checked');
			profileOptions[optnID] = optnEnabled;
			localStorage.setItem('rprofile' + localStorage.getItem('activeProfile'), JSON.stringify(profileOptions));
			updateProfileTitle(localStorage.getItem('activeProfile'));
			if(optnID == 'optnCoin') {
				if(optnEnabled) $('#optnCoin_Interval').removeAttr('disabled');
				else $('#optnCoin_Interval').attr('disabled', 'disabled');
			}
			else if(optnID == 'optnMove') {
				if(optnEnabled) $('#optnMove_Interval').removeAttr('disabled');
				else $('#optnMove_Interval').attr('disabled', 'disabled');
			}
		});
		textfields.on('change', function() {
			var optnID = $(this).attr('id');
			var optnValue = $(this).val();
			if(parseInt(optnValue) < parseInt($(this).attr('min'))) $(this).val($(this).attr('min')).change();
			profileOptions[optnID] = optnValue;
			localStorage.setItem('rprofile' + localStorage.getItem('activeProfile'), JSON.stringify(profileOptions));
			updateProfileTitle(localStorage.getItem('activeProfile'));
			if(optnID == 'optnCoin_Interval') loopCount = 0;
		});

		profiles.on('click', function() {
			var curProfile = parseInt($(this).text()) ? parseInt($(this).text()) : 0;
			var profileExist = false;
			profiles.css({ 'background-color': '#222', 'color': '#EEE' });
			$(this).css({ 'background-color': '#D22' });
			localStorage.setItem('activeProfile', curProfile);
			if(localStorage.getItem('rprofile' + curProfile)) { profileOptions = JSON.parse(localStorage.getItem('rprofile' + curProfile)); profileExist = true; }
			if(!Object.keys(profileOptions).length) profileExist = false;

			checkboxes.each(function() {
				var optnID = $(this).attr('id');
				var optnEnabled = $(this).is(':checked');
				if(profileExist) {
					if(optnEnabled && !profileOptions[optnID]) $(this).click().change();
					else if(profileOptions[optnID] === true && !optnEnabled) $(this).click().change();
				}
			});
			textfields.each(function() {
				var optnID = $(this).attr('id');
				var optnValue = $(this).val();
				if(!profileExist) {
					if(optnID == 'nick') {
						if(localStorage.getItem('profile' + curProfile) !== null) {
							$(this).val(JSON.parse(localStorage.getItem('profile' + curProfile)).nick);
							localStorage.removeItem('profile' + curProfile);
						}
						else $(this).val('ௌௌௌௌௌௌௌௌௌௌௌௌௌௌௌ');
					}
					profileOptions[optnID] = $(this).val();
				}
				if(profileExist && profileOptions[optnID] != optnValue) $(this).val(profileOptions[optnID]).change();
			});
			if($('#gamemode').val() == ':party')$('button[data-itr="create_party"]').click();
			else if(window.location.href.indexOf('#') != -1) $('#cancel-party-btn').click();
			localStorage.setItem('rprofile' + localStorage.getItem('activeProfile'), JSON.stringify(profileOptions));
			updateProfileTitle(localStorage.getItem('activeProfile'));
		});
	}

	function appendGoogleAd() {
		window.google_ad_client = "ca-pub-8318511014856551"; window.google_ad_slot = "5881481221"; window.google_ad_width = 300; window.google_ad_height = 250;
		var container = document.getElementById('agario-web-incentive'); container.style.backgroundImage = '';
		var w = document.write;
		document.write = function (content) {
			container.innerHTML = content;
			document.write = w;
		};
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'http://pagead2.googlesyndication.com/pagead/show_ads.js';
		document.body.appendChild(script);
	}

	function getCoin() {
		var xPoses = [ -150, 192, 192, 192, 232 ];
		var yPoses = [ 30, -208, -160, -150, -62 ];
		var delays = [ 500, 1700, 1750, 1800, 2000 ];
		for(var i = 0; i < xPoses.length; i++) {
			(function(j) {
				setTimeout(function() { simulateClick(window.innerWidth / 2 + xPoses[j], window.innerHeight / 2 + yPoses[j], canvas2); }, delays[j]);
			})(i);
		}
	}

	function showPanel(x) {
		$('#openfl-content').css({'opacity' : '0.30'});
		$('#openfl-overlay').css({'pointer-events' : 'none'});
		if(x == 1) $('#openShopBtn').click();
		else if(x == 2) $('#skinButton').click();
		else if(x == 3) $('#boostButton').click();
		else if(x == 4) $('#massButton').click();
		else if(x == 5) $('#freeCoins').click();
	}

	function simulateMove(x, y, el) {
		if(!el) el = document.elementFromPoint(x, y);
		var ev = new MouseEvent('mousemove', { 'clientX': x, 'clientY': y }); el.dispatchEvent(ev);
	}

	function simulateClick(x, y, el) {
		// console.log(x + ',' + y);
		if(!el) el = document.elementFromPoint(x, y);
		var ev = new MouseEvent('mousedown', { 'clientX': x, 'clientY': y }); el.dispatchEvent(ev);
		ev = new MouseEvent('mouseup', { 'clientX': x, 'clientY': y }); el.dispatchEvent(ev);
	}

	function setIntervalX(callback, delay, repetitions) {
		var x = 0;
		var intervalID = window.setInterval(function () {
			callback();
			if (++x === repetitions) window.clearInterval(intervalID);
		}, delay);
	}

	function timeSince(date) {
		var seconds = Math.floor((new Date() - date) / 1000);
		var interval = Math.floor(seconds / 31536000);
		if(interval > 1) return interval + ' years'; interval = Math.floor(seconds / 2592000);
		if(interval > 1) return interval + ' months'; interval = Math.floor(seconds / 86400);
		if(interval > 1) return interval + ' days'; interval = Math.floor(seconds / 3600);
		if(interval > 1) return interval + ' hours'; interval = Math.floor(seconds / 60);
		if(interval > 1) return interval + ' minutes';
		return Math.floor(seconds) + ' seconds';
	}

})();




/*
var script = document.createElement('script');
script.src = document.location.protocol+"//greasyfork.org/scripts/20003-agar-io-auto-respawn-code/code/Agario%20auto%20respawn%20code.js";
(document.body || document.head || document.documentElement).appendChild(script);
*/

