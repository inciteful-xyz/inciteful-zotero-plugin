PROFILEDIR=/Users/weishuhn/Library/Application\ Support/Zotero/Profiles/pvgfo6z5.Dev

setup-debugger-profile:
	cp zotero-plugin@inciteful.xyz ${PROFILEDIR}/extensions/zotero-plugin@inciteful.xyz \
		&& sed -i '' '/extensions\.lastAppVersion/d' ${PROFILEDIR}/prefs.js \
		&& sed -i '' '/extensions.lastAppBuildId/d' ${PROFILEDIR}/prefs.js
	