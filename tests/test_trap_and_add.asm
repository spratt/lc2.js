		;; test_trap_and_add.asm
		;; This LC2 program performs the following operations:
		;; 		1) input two characters
		;; 		2) adds the characters
		;; 		3) output the result

		.ORIG $3000				; directive: program load location
		
		;; get the character inputs
		IN 						; read character into R0
		ADD R1, R0, #0			; move R0 into R1
		IN						; read character into R0

		;; do the addition
		ADD R0, R0, R1			; add numbers

		;; write the results
		OUT						; write the single-character result
		HALT					; stop the computer
		.END					; end of code
