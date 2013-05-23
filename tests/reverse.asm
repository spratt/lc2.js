		;; reverse.asm
		;; 3.6.4 figure 5 on page 50 of
		;; http://www.cs.utexas.edu/users/fussell/courses/cs310h/simulator/lc2.pdf
		;; This LC2 program performs the following operations:
		;;      1) input up to 10 characters
		;;      2) print out the characters in reverse order
		;; If more than 10 characters are typed, the program may break.
		;; R0 is the current character being read or printed
		;; R1 is a temporary
		;; R2 is the count of characters that have been read in so far
		;; R3 is the address into the buffer (same as bufptr)

		.ORIG $3000				; directive: program load location

		;; Set up
		lea R3, BUFFER			; R3 points to start of buffer
		and	R2, R2, #0			; zero out character counter

		;; Read characters and store them
READ:	in						; read a character from keyboard
		add R1, R0, $-A			; subtract ASCII value of ENTER key
		brz	PRNTIT				; if ENTER pressed, done with input
		str R0, R3, #0			; store R0 (character) into buffer
		add R3, R3, #1			; increment buffer pointer
		add R2, R2, #1			; increment character count
		jmp READ				; read the next character

PRNTIT:	add R3, R3, #-1			; move pointer to prev char read

		;; Print the characters in reverse order
PRINT:	and R2, R2, R2			; and R2 to itself to set the flags
		brz DONE				; if R2 is zero, no more to print
		ldr R0, R3, #0			; load character pointed to by R3
		out						; print the character
		add R2, R2, #-1			; decrement character count
		add R3, R3, #-1			; decrement buffer pointer
		jmp PRINT				; print the next character

DONE:	halt					; kill the computer

		;; Memory fills
BUFFER:	.BLKW 10 $0000			; 10 character buffer
		.END					; no more code
