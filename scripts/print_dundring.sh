#!/bin/sh
# echo "
#      ////////////////          
#     /////////////////////      
#    ////////////////////////    
#   /////////      ///////////  
#  /////////           //////// 
#     ////////           ///////
#     ///////            ///////
#     //////              //////
#     /////              ///////
#     ////              ////////
#     ///             ///////// 
#     // ////////////////////   
#     / ///////////////////     
#      ///////////////          
# "

# "#716FAC"
# "#767BB4"
# "#7B88BD"
# "#8096C7"
# "#86A5D2"
# "#8CB4DD"
# "#92C4EA"

# fromhex A52A2A
# fromhex "#A52A2A"
# BLUE_VIOLET=$(fromhex "#8A2BE2")
# http://unix.stackexchange.com/a/269085/67282
function fromhex() {
  hex=$1
  if [[ $hex == "#"* ]]; then
    hex=$(echo $1 | awk '{print substr($0,2)}')
  fi
  r=$(printf '0x%0.2s' "$hex")
  g=$(printf '0x%0.2s' ${hex#??})
  b=$(printf '0x%0.2s' ${hex#????})
  echo -e `printf "%03d" "$(((r<75?0:(r-35)/40)*6*6+(g<75?0:(g-35)/40)*6+(b<75?0:(b-35)/40)+16))"`
}

function print_dundring_logo() {
  echo $(tput setaf $(fromhex "#717BAC"))\ \ \ \ \ ////////////////          $(tput sgr0)
  echo $(tput setaf $(fromhex "#717BAC"))\ \ \ \ ////////////////////      $(tput sgr0)
  echo $(tput setaf $(fromhex "#717BAC"))\ \ \ ///////////////////////    $(tput sgr0)
  echo $(tput setaf $(fromhex "#717BAC"))\ \ /////////\ \ \ \ \ \ ///////////  $(tput sgr0)
  echo $(tput setaf $(fromhex "#767BB4"))\ /////////\ \ \ \ \ \ \ \ \ \ \ //////// $(tput sgr0)
  echo $(tput setaf $(fromhex "#767BB4"))\ \ \ \ ////////\ \ \ \ \ \ \ \ \ \ \ ///////$(tput sgr0)
  echo $(tput setaf $(fromhex "#7B88BD"))\ \ \ \ ///////\ \ \ \ \ \ \ \ \ \ \ \ ///////$(tput sgr0)
  echo $(tput setaf $(fromhex "#7B88BD"))\ \ \ \ //////\ \ \ \ \ \ \ \ \ \ \ \ \ \ //////$(tput sgr0)
  echo $(tput setaf $(fromhex "#8096C7"))\ \ \ \ /////\ \ \ \ \ \ \ \ \ \ \ \ \ \ ///////$(tput sgr0)
  echo $(tput setaf $(fromhex "#8096C7"))\ \ \ \ ////\ \ \ \ \ \ \ \ \ \ \ \ \ \ ////////$(tput sgr0)
  echo $(tput setaf $(fromhex "#86A5D2"))\ \ \ \ ///\ \ \ \ \ \ \ \ \ \ \ \ \ ///////// $(tput sgr0)
  echo $(tput setaf $(fromhex "#86A5D2"))\ \ \ \ //\ ////////////////////   $(tput sgr0)
  echo $(tput setaf $(fromhex "#92C4EA"))\ \ \ \ /\ ///////////////////     $(tput sgr0)
  echo $(tput setaf $(fromhex "#92C4EA"))\ \ \ \ \ ///////////////          $(tput sgr0)
  echo ""
  echo "   " \
 $(tput setaf $(fromhex "#717BAC"))D$(tput sgr0)\
 $(tput setaf $(fromhex "#717BAC"))U$(tput sgr0)\
 $(tput setaf $(fromhex "#767BB4"))N$(tput sgr0)\
 $(tput setaf $(fromhex "#767BB4"))D$(tput sgr0)\
 $(tput setaf $(fromhex "#7B88BD"))R$(tput sgr0)\
 $(tput setaf $(fromhex "#7B88BD"))I$(tput sgr0)\
 $(tput setaf $(fromhex "#8096C7"))N$(tput sgr0)\
 $(tput setaf $(fromhex "#8096C7"))G$(tput sgr0)\
 $(tput setaf $(fromhex "#86A5D2")).$(tput sgr0)\
 $(tput setaf $(fromhex "#86A5D2"))C$(tput sgr0)\
 $(tput setaf $(fromhex "#92C4EA"))O$(tput sgr0)\
 $(tput setaf $(fromhex "#92C4EA"))M$(tput sgr0)
  echo ""
}


print_dundring_logo
