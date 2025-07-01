const format = {
	//받침에 따라 자동으로 텍스트 추가
	checkBatchimEnding(text) {
		const lastLetter = text[text.length - 1];
		const uni = lastLetter.charCodeAt(0);
		// 종성(받침) 여부를 확인
		return `${text}${(uni - 44032) % 28 !== 0 ? '을' : '를'}`;
	},
	//검색 시 mark 추가
	highlighted: (text = '', highlight = '') => {
		let highlightText = ''; 
		if(typeof highlight === 'object') {
			highlightText = highlight?.text;
		} else {
			highlightText = highlight;
		}
		if (!highlightText?.trim()) {
			return `<span>${text}</span>`
		}
		const escapeRegExp = (str = '') => (
			str.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1')
		)
		const regex = new RegExp(`(${escapeRegExp(highlightText)})`, 'gi')
   		const parts = text.split(regex)

		let result = ''
		result += parts.filter(part => part).map((part, i) => {
			return regex.test(part) ? `<mark style="background-color: #FFE2E0;" key=${i}>${part}</mark>` : `<span key=${i}>${part}</span>`
		})
		result = result.replaceAll(',', '')
		return result;
	},
	//유효성 검사
	validate: {
		//이메일
		emailReg(value) {
			const regEmail = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i

			return regEmail.test(value)
		},
		passwordLength(value) {
			if(value.length < 8 || value.length > 20) {
				return false
			}
			return true;
		},
		passwordReg(value) {
			//영문과 숫자 + 특수문자 필수 포함
			let regPw = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^*+=-]).+$/

			return regPw.test(value)
		}
	},
	date: (date) => {
		const year = date.getFullYear();
		const month = date.getMonth() + 1; // 월은 0부터 시작하므로 +1
		const day = date.getDate();
		return `${year}년 ${month}월 ${day}일`;
	}
}

export default format