@REM Get short SHA of latest commit
@ECHO OFF
@REM git rev-parse --short HEAD > curr_com.txt
@REM set /p curr_com=<curr_com.txt
@REM echo %curr_com%
@REM echo %DATE%

echo %DATE:~10,4%-%DATE:~7,2%-%DATE:~4,2% %TIME:~0,2%:%TIME:~3,2%:%TIME:~6,2%