#!/bin/sh

# This file is designed to make the AR Drone 2.0 connect to a spesified
# infrastructure network. Settings are at the top of the script.
# In brief the script makes the drone check if it is on the infrastrcutre
# If it is on that connections check if it is in range, otherwise switch
# parrot's default.
# If it is not, which means it is on default parrot, than checks if there
# are any incoming connections. If there aren't tries again ifrastructure.
# Has 2 timeouts - one for the timeout between loops, and one for waiting
# for connection after switching to parrot's default

# Find absolute path to this script
SCRIPT=`readlink -f $0`
INSTALL_PATH=`dirname $SCRIPT`
LOG=$INSTALL_PATH/log

# Settings
ESSID=voyager2.0
IP=192.168.1.25
NETMASK=255.255.255.0
TIMEOUT=30
TIMEOUT_DISCONNECT=30
# ARDrone default addresses
BASE_ADDRESS=192.168.1.
LAST_NUMBER="2 3 4 5"
CONNECTED=0

# Retrieving ad-hoc ssid to restore the network
DRONESSID=`grep ssid_single_player /data/config.ini | awk -F "=" '{print $2}'`

# Removing leading and trailing spaces
DRONESSID=`echo $DRONESSID`

if [ -n "$DRONESSID" ]
then
  echo "Found drone ssid =$DRONESSID"
else
        # Default SSID.
        DRONESSID=ardrone_wifi
fi

echo "Network configuration" > $LOG
echo "Drone SSID                  : $DRONESSID" >> $LOG
echo "Access Point ESSID          : $ESSID" >> $LOG
echo "Infrastructure IP address   : $IP" >> $LOG
echo "Infrastructure Netmask      : $NETMASK" >>$LOG
echo "Timeout                     : $TIMEOUT" >>$LOG
echo "Disconnection extra timeout : $TIMEOUT_DISCONNECT" >>$LOG

while [ 1 ]
do
        CONFIG=`iwconfig ath0`
        # First check if we are connected to infrastructure and it is in range
        if `echo $CONFIG | grep -q $ESSID` ;
        then
                # if ping -W 1 -c 1 -q $IP ;
                # Signal level:-96 dBm indicates we lost the signal in managed mode (this is the lowest value)
                if `echo $CONFIG | grep -q "Signal level:-96 dBm"` ;
                then
                        echo "Restoring default drone network with SSID $DRONESSID" >> $LOG
                        killall udhcpc
                        udhcpd /tmp/udhcpd.conf
                        ifconfig ath0 down
                        iwconfig ath0 mode Master essid $DRONESSID channel auto commit
                        ifconfig ath0 192.168.1.1 netmask 255.255.255.0 up
			sleep $TIMEOUT_DISCONNECT
                else
                        echo "Connected to $ESSID" >> $LOG
                fi
        else
                # If we are connected to the default network check if anyone connected
                CONNECTED=0
                for i in $LAST_NUMBER
                do
                        if ping -W 1 -c 1 -q $BASE_ADDRESS$i ;
                        then
                                CONNECTED=1
                                echo "Address $BASE_ADDRESS$i connected to default" >> $LOG
                                break
                        fi
                done
                # If noone connected try again infrastructure
                if [ "$CONNECTED" -eq 0 ] ;
                then
                        echo "Switching to Managed mode with ESSID : $ESSID" >> $LOG
                        killall udhcpd
                        ifconfig ath0 down
                        iwconfig ath0 mode Managed essid $ESSID ap any channel auto commit
                        if [ -n "$IP" ];
                        then
                                echo "Using settings: $IP $NETMASK" >> $LOG
                                ifconfig ath0 $IP netmask $NETMASK up
                        else
                                echo "Using DHCP settings" >> $LOG
                                ifconfig ath0 up
                                udhcpc -b -i ath0 >> $LOG
                        fi
                fi
        fi
        sleep $TIMEOUT
done
