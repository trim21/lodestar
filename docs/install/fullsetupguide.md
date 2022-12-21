**Last Updated:** December 21, 2022

# Full Setup Guide Overview

This is the comprehensive step-by-step guide to setup a Ubuntu-based staking validator for Post-Merge Ethereum using ChainSafe's Lodestar consensus client on the Ethereum Beacon Chain with Docker (the recommended method to use Lodestar for production environments). This comprehensive guide will setup Lodestar **with metrics** and will require more resources than usual (CPU, RAM and SSD Storage). 

<!-- prettier-ignore-start -->
!!! info 
    **NOTE:** To quickstart a simple Lodestar staking setup without metrics, please use our [@ChainSafe/lodestar-quickstart](https://github.com/ChainSafe/lodestar-quickstart) scripts to minimize setup time and configuration. A separate guide for using these scripts is located under [Quickstart Setup Guide](install/quicksetupguide.md)
<!-- prettier-ignore-end -->

This is an adaptation of [Somer Esat's guides](https://someresat.medium.com/) specifically for Lodestar users and testers.

This setup is based on the following technologies:

- [Ubuntu v22.04 (LTS) x64 server](https://ubuntu.com/download/server)
- Ethereum Execution (eth1) clients: 
  - [Nethermind](https://nethermind.io/) | [Github](https://github.com/NethermindEth/nethermind)
  - [Hyperledger Besu](https://www.hyperledger.org/) | [Github](https://github.com/hyperledger/besu)
  - [Go-Ethereum Execution Node (Geth)](https://geth.ethereum.org/) | [Github](https://github.com/ethereum/go-ethereum/releases/)
- [ChainSafe's Lodestar Ethereum Consensus Client](https://lodestar.chainsafe.io/) | [Github](https://github.com/ChainSafe/lodestar)
- [Docker Engine](https://docs.docker.com/engine/) and [Docker Compose](https://docs.docker.com/compose/)

<!-- prettier-ignore-start -->
!!! warning
    **DISCLAIMER:** This article (the guide) is for informational purposes only and does not constitute professional advice. The author does not guarantee accuracy of the information in this article and the author is not responsible for any damages or losses incurred by following this article. A full disclaimer can be found at the bottom of this page — please read before continuing.
<!-- prettier-ignore-end -->

## Support
For technical support please reach out to:
- The Lodestar team actively develops and collaborates on the [ChainSafe Discord Server](https://discord.gg/642wB3XC3Q) under ***#lodestar-general*** channel.
- Please subscribe to our Discord server announcements on the [ChainSafe Discord Server](https://discord.gg/642wB3XC3Q) under ***#lodestar-announcements*** channel.

## Prerequisites
This guide assumes knowledge of Ethereum, Docker, staking and Linux.

This guide requires the following before getting started:

- [Ubuntu Server v22.04 (LTS) amd64](https://ubuntu.com/download/server) or newer, installed and running on a local computer or in the cloud. *A locally running computer is encouraged for greater decentralization — if the cloud provider goes down then all nodes hosted with that provider go down.*

## Testnet to Mainnet
If moving from a testnet setup to a mainnet setup it is strongly recommended that you start on fresh (newly installed) server instance. This guide has not been tested for migration scenarios and does not guarantee success if you are using an existing instance with previously installed testnet software.

## Hardware Requirements
|           | Minimum                                          | Recommended                                             |
| --------- | ------------------------------------------------ | ------------------------------------------------------- |
| Processor | Intel Core i5–760 or AMD FX-8100                 | Intel Core i7–4770 or AMD FX-8310                       |
| Memory    | 8GB RAM                                          | 16GB+ RAM                                               |
| Storage   | 20GB available space SSD (Consensus Client Only) | 2TB+ available space SSD (Consensus + Execution Client) |
| Internet  | 5-10mbps (Synced)                                | 50+mbps (Syncing)                                       |

<!-- prettier-ignore-start -->
!!! note
    Check your available disk space. Even you have a large SSD there are cases where Ubuntu is reporting only 200GB free. If this applies to you then take a look at [***Appendix A — Expanding the Logical Volume.***](https://hackmd.io/@philknows/HkROkZW55#Appendix-A---Expanding-the-Logical-Volume)
<!-- prettier-ignore-end -->

---
## Setup Environment
This guide will provide instructions for running a local execution node, **a requirement** for post-merge on Ethereum.

### Update Ubuntu
Ensure all updates to your Ubuntu Server are complete.

```
sudo apt update && sudo apt upgrade -y
```

Hit `Enter` if required to restart services.

### Install Docker Engine & Docker Compose

We must install Docker Engine & Docker Compose to run the images on your local machine.

```
sudo apt install -y docker-compose
```
```
sudo systemctl enable --now docker
```
Verify the installation was successful.
```
docker-compose --version
```

Docker Compose should return a non-error stating the version and build. 

![](https://i.imgur.com/RWNRu2E.png)


---

## Download and Configure Lodestar
Clone the [Lodestar monorepo](https://github.com/ChainSafe/lodestar) from Github into your local server.
```
cd ~ && git clone https://github.com/ChainSafe/lodestar.git
```

![](https://i.imgur.com/npv9Otl.png)


### Setup the Lodestar environment file
The docker-compose file requires that a `.env` file be present in this directory. The `default.env` file provides a template and can be copied. Navigate to the extracted directory and copy the template:

```
cd ~/lodestar && cp default.env .env
```


Modify the parameters inside the `.env` file. Use the nano text editor.

```
nano .env
```

![](https://i.imgur.com/yvgbKuC.png)

<!-- prettier-ignore-start -->
!!! tip
    **TESTNET USERS:** If you want to use Lodestar in a testnet, change the option `LODESTAR_NETWORK=` to the desired network such as `LODESTAR_NETWORK=goerli`. 
<!-- prettier-ignore-end -->

Set a password after `GF_SECURITY_ADMIN_PASSWORD=` for your Grafana metrics dashboard if you would like to install metrics.

Then, press `CTRL` + `x` then `y` then `Enter` to save and exit. 

### Create JWT Secret
We will generate a JWT secret that is shared by the Execution client and Lodestar in order to have a required secure connection for the `Engine API` on port `8551`.

```
openssl rand -hex 32 | tr -d "\n" > "jwtsecret"
```

### Create a new Docker Compose Environment
We will now generate a new `docker-compose.yml` which defines 4 main services to run a local Lodestar node with metrics: 
- An execution node (`nethermind_docker` OR `besu_docker` OR `geth_docker`), 
- `beacon_node`
- `prometheus` 
- `grafana` 

Using the text editor `nano`, open the editor:

```
nano
```

## Add an Execution Node, a Lodestar Beacon Node, a Prometheus Server and a Grafana Service
A local Ethereum execution node is **required** for staking. This guide will provide instructions for running a local execution node using either [Nethermind](https://nethermind.io/), [Go-Ethereum (Geth)](https://geth.ethereum.org/), or [Hyperledger Besu](https://besu.hyperledger.org/en/stable/) within Docker containers via Docker Compose. 

<!-- prettier-ignore-start -->
!!! note
    Check your available disk space. An Ethereum execution (Eth1) node requires roughly 600GB of space. Even if you have a large SSD there are cases where Ubuntu is reporting only 200GB free. If this applies to you then take a look at [***Appendix A — Expanding the Logical Volume***](#Appendix-A---Expanding-the-Logical-Volume).
<!-- prettier-ignore-end -->

For the next step, **please choose only 1 of the following 3 options.** Doing more than 1 will create port conflicts:

### Option 1/3: Nethermind Execution Node
If you would like to use [Nethermind](https://nethermind.io/) as your Ethereum Execution Client (eth1), copy and paste the following into the text editor:

<!-- prettier-ignore-start -->
!!! tip
    **NOTE:** YAML files are sensitive to indentations. Copy the lines **exactly** as seen below.
<!-- prettier-ignore-end -->

``` yaml linenums="1"
version: "3.4"
services:
  nethermind_docker:
    image: nethermind/nethermind:latest
    restart: always
    volumes:
      - nethermind_docker:/data
      - "./jwtsecret:/data/jwtsecret"
    command: --config mainnet --datadir /data --Network.DiscoveryPort=30303 --Network.P2PPort=30303 --JsonRpc.Enabled=true --JsonRpc.EnabledModules="net,eth,consensus,subscribe,web3,admin" --JsonRpc.Port=8545 --JsonRpc.Host=0.0.0.0 --Init.DiagnosticMode="None" --JsonRpc.AdditionalRpcUrls="http://localhost:8545|http;ws|net;eth;subscribe;engine;web3;client|no-auth,http://localhost:8551|http;ws|net;eth;subscribe;engine;web3;client" --JsonRpc.JwtSecretFile /data/jwtsecret --Sync.SnapSync=true
    network_mode: host
    container_name: nethermind_docker

  beacon_node:
    image: chainsafe/lodestar:latest
    restart: always
    volumes:
      - beacon_node:/data
      - logs:/logs
      - "./jwtsecret:/jwtsecret"
    env_file: .env
    network_mode: host
    command: beacon --dataDir /data --rest --execution.urls http://127.0.0.1:8551 --rest.address 0.0.0.0 --rest.namespace '*' --metrics --logFile /logs/beacon.log --logFileLevel debug --logFileDailyRotate 5 --jwt-secret /jwtsecret
    environment:
      NODE_OPTIONS: --max-old-space-size=4096

  prometheus:
    build:
      context: docker/prometheus
      args:
        # Linux:  http://localhost:8008
        # MacOSX: http://host.docker.internal:8008
        BEACON_URL: localhost:8008
    restart: always
    network_mode: host
    volumes:
      - "prometheus:/prometheus"

  grafana:
    build: docker/grafana
    restart: always
    network_mode: host
    volumes:
      - "grafana:/var/lib/grafana"
      - "./dashboards:/dashboards"
    environment:
      # Linux:  http://localhost:9090
      # MacOSX: http://host.docker.internal:9090
      PROMETHEUS_URL: http://localhost:9090
      GF_SECURITY_ADMIN_PASSWORD: ${GF_SECURITY_ADMIN_PASSWORD}

volumes:
  nethermind_docker:
  beacon_node:
  logs:
  prometheus:
  grafana:
```

<!-- prettier-ignore-start -->
!!! tip
    **TESTNET USERS:** If you are running on the Goerli testnet, make sure to modify the `command` configuration of the execution client you plan to use. 

    Example of Nethermind on the Goerli Testnet (Line 9):
    ``` yaml
        command: --config goerli --datadir /data --Network.DiscoveryPort=30303 --Network.P2PPort=30303 --Init.DiagnosticMode=None --JsonRpc.Enabled=true --JsonRpc.Host=0.0.0.0 --JsonRpc.AdditionalRpcUrls "http://localhost:8545|http;ws|net;eth;subscribe;engine;web3;client|no-auth,http://localhost:8551|http;ws|net;eth;subscribe;engine;web3;client" --JsonRpc.JwtSecretFile /nethermind/keystore/jwtsecret
    ```

!!! info
    You can also add/change [**Nethermind CLI Commands**](https://docs.nethermind.io/nethermind/nethermind-utilities/cli) to run such as `--Network.DiscoveryPort=30303` to change the listening port on `command:` line 9.

    You can also add [**Lodestar CLI commands**](https://chainsafe.github.io/lodestar/reference/cli) to run by adding it to `command:` line 22.
<!-- prettier-ignore-end -->

When you're done modifying this file, press `CTRL`+ `x` to exit and press `y`, then name the file `docker-compose.yml` and press `y` to overwrite the current version. Continue to the next step: **(Optional) Quick Sync your Beacon Node**.

### Option 2/3: Hyperledger Besu Execution Node
If you would like to use [Hyperledger Besu](https://besu.hyperledger.org/en/stable/) as your Ethereum Execution Client (eth1), copy and paste the following into the text editor:

<!-- prettier-ignore-start -->
!!! tip
    **NOTE:** YAML files are sensitive to indentations. Copy the lines **exactly** as seen below.
<!-- prettier-ignore-end -->
``` yaml linenums="1"
version: "3.4"
services:
  besu_docker:
    image: hyperledger/besu:develop
    restart: always
    volumes:
      - besu_docker:/data/besu
      - "./jwtsecret:/data/jwtsecret"
    command: --data-path=/data/besu --network=mainnet --network-id=1 --engine-jwt-secret=/data/jwtsecret --rpc-http-enabled=true --rpc-http-api=ADMIN,CLIQUE,MINER,ETH,NET,DEBUG,TXPOOL,TRACE --rpc-http-host=0.0.0.0 --rpc-http-port=8545 --engine-rpc-port=8551 --rpc-http-cors-origins="*" --host-allowlist="*" --engine-host-allowlist="*" --p2p-enabled=true --engine-jwt-enabled=true
    network_mode: host
    user: root
    container_name: besu_docker

  beacon_node:
    image: chainsafe/lodestar:latest
    restart: always
    volumes:
      - beacon_node:/data
      - logs:/logs
      - "./jwtsecret:/jwtsecret"
    env_file: .env
    network_mode: host
    command: beacon --dataDir /data --rest --execution.urls http://127.0.0.1:8551 --rest.address 0.0.0.0 --rest.namespace '*' --metrics --logFile /logs/beacon.log --logFileLevel debug --logFileDailyRotate 5 --jwt-secret /jwtsecret
    environment:
      NODE_OPTIONS: --max-old-space-size=4096

  prometheus:
    build:
      context: docker/prometheus
      args:
        # Linux:  http://localhost:8008
        # MacOSX: http://host.docker.internal:8008
        BEACON_URL: localhost:8008
    restart: always
    network_mode: host
    volumes:
      - "prometheus:/prometheus"

  grafana:
    build: docker/grafana
    restart: always
    network_mode: host
    volumes:
      - "grafana:/var/lib/grafana"
      - "./dashboards:/dashboards"
    environment:
      # Linux:  http://localhost:9090
      # MacOSX: http://host.docker.internal:9090
      PROMETHEUS_URL: http://localhost:9090
      GF_SECURITY_ADMIN_PASSWORD: ${GF_SECURITY_ADMIN_PASSWORD}

volumes:
  besu_docker:
  beacon_node:
  logs:
  prometheus:
  grafana:
```

<!-- prettier-ignore-start -->
!!! tip
    **TESTNET USERS:** If you are running on the Goerli testnet, make sure to modify the `command` configuration of the execution client you plan to use with the proper `network_id`.

    Ropsten Testnet: `--network-id=3`
    Goerli Testnet: `--network-id=5`

    **Example of Besu on the Goerli Testnet (Line 8):
    ```
        command: --network-id=5 --rpc-http-enabled=true --rpc-http-api=ADMIN,CLIQUE,MINER,ETH,NET,DEBUG,TXPOOL,TRACE --rpc-http-host=0.0.0.0 --rpc-http-port=8545 --rpc-http-cors-origins=\"*\" --host-allowlist=\"*\" --p2p-enabled=true 
    ```

!!! info
    You can also add/change [**Besu CLI Commands**](https://besu.hyperledger.org/en/stable/Reference/CLI/CLI-Syntax/) to run such as `--p2p-port=123` to change the listening port on `command:` line 9.

    **NOTE:** You can also add [**Lodestar CLI commands**](https://chainsafe.github.io/lodestar/reference/cli) to run by adding it to `command:` line 23.
<!-- prettier-ignore-end -->

When you're done modifying this file, press `CTRL`+ `x` to exit and press `y`, then name the file `docker-compose.yml` and press `y` to overwrite the current version. Continue to the next step: **(Optional) Quick Sync your Beacon Node**.

### Option 3/3: Go-Ethereum (Geth) Execution Node
If you would like to use [Go-Ethereum (Geth)](https://geth.ethereum.org/) as your Ethereum Execution Client (eth1), copy and paste the following into the text editor:

<!-- prettier-ignore-start -->
!!! tip
    **NOTE:** YAML files are sensitive to indentations. Copy the lines **exactly** as seen below.
<!-- prettier-ignore-end -->

``` yaml linenums="1"
version: "3.4"
services:
  geth_docker:
    image: ethereum/client-go:stable
    restart: always
    volumes:
      - geth_docker:/data
      - "./jwtsecret:/data/jwtsecret"
    command: --mainnet --datadir /data --http --cache 2048 --maxpeers 30 --authrpc.addr localhost --authrpc.port 8551 --authrpc.vhosts localhost --authrpc.jwtsecret /data/jwtsecret 
    network_mode: host
    container_name: geth_docker

  beacon_node:
    image: chainsafe/lodestar:latest
    restart: always
    volumes:
      - beacon_node:/data
      - logs:/logs
      - "./jwtsecret:/jwtsecret"
    env_file: .env
    network_mode: host
    command: beacon --dataDir /data --rest --execution.urls http://127.0.0.1:8551 --rest.address 0.0.0.0 --rest.namespace '*' --metrics --logFile /logs/beacon.log --logFileLevel debug --logFileDailyRotate 5 --jwt-secret /jwtsecret
    environment:
      NODE_OPTIONS: --max-old-space-size=4096

  prometheus:
    build:
      context: docker/prometheus
      args:
        # Linux:  http://localhost:8008
        # MacOSX: http://host.docker.internal:8008
        BEACON_URL: localhost:8008
    restart: always
    network_mode: host
    volumes:
      - "prometheus:/prometheus"

  grafana:
    build: docker/grafana
    restart: always
    network_mode: host
    volumes:
      - "grafana:/var/lib/grafana"
      - "./dashboards:/dashboards"
    environment:
      # Linux:  http://localhost:9090
      # MacOSX: http://host.docker.internal:9090
      PROMETHEUS_URL: http://localhost:9090
      GF_SECURITY_ADMIN_PASSWORD: ${GF_SECURITY_ADMIN_PASSWORD}

volumes:
  geth_docker:
  beacon_node:
  logs:
  prometheus:
  grafana:
```

<!-- prettier-ignore-start -->
!!! tip
    **TESTNET USERS:** If you are running on the Goerli testnet, make sure to modify the `command` configuration of the execution client you plan to use. 

    **Example of Geth on the Goerli Testnet (Line 9):
    ```
        command: --goerli --datadir /data --http --cache 2048 --maxpeers 30 --authrpc.addr localhost --authrpc.port 8551 --authrpc.vhosts localhost --authrpc.jwtsecret /data/geth/jwtsecret
    ```

!!! info
    **NOTE:** You can also add [**Go Ethereum CLI commands**](https://geth.ethereum.org/docs/interface/command-line-options) to run such as `--port 123` to change the listening port on `command:` line 9.

    **NOTE:** You can also add [**Lodestar CLI commands**](https://chainsafe.github.io/lodestar/reference/cli) to run by adding it to `command:` line 22.
<!-- prettier-ignore-end -->

When you're done modifying this file, press `CTRL`+ `x` to exit and press `y`, then name the file `docker-compose.yml` and press `y` to overwrite the current version. Continue to the next step: **(Optional) Quick Sync your Beacon Node**.

---

## Add your weak subjectivity (checkpoint sync) provider

Weak subjectivity (checkpoint sync) allows your beacon node to sync within minutes by utilizing a trusted checkpoint from a provider like Infura or a trusted friend's beacon node.

**We recommend using this feature** so you do not need to wait days to sync from genesis and will mitigate your susceptibility to [long-range attacks](https://blog.ethereum.org/2014/11/25/proof-stake-learned-love-weak-subjectivity/). If you would rather sync from genesis, you can skip this step.

Minimize your risk of syncing a malicious chain from a malicious checkpoint by verifying the trusted checkpoint from multiple sources.

1. View the community maintained list of [Beacon Chain checkpoint sync endpoints](https://eth-clients.github.io/checkpoint-sync-endpoints/)
2. Verify multiple endpoint links and ensure the latest finalized and latest justified block roots are the same
3. Choose one of those endpoint URLs
4. Re-open the `docker-compose.yml` file by using the command:
```
nano docker-compose.yml
```
5. Add to the end of **Line 22** `command:` in your `docker-compose.yml` file:
```
--checkpointSyncUrl <checkpointURL>
```

<!-- prettier-ignore-begin -->
!!! warning
    **TESTNET USERS**: Ensure you use checkpoint URLs from the list above corresponding to the testnet you are trying to sync to.

!!! info
    Example of Lodestar Beacon with checkpoint sync for mainnet **(Line 22)**:
    ```
        command: beacon --dataDir /data --rest --rest.address 0.0.0.0 --metrics --logFile /logs/beacon.log --logFileLevel debug --logFileDailyRotate 5 --jwt-secret /jwtsecret --checkpointSyncUrl https://beaconstate-mainnet.chainsafe.io
    ```
<!-- prettier-ignore-end -->

When you're done modifying this file, press `CTRL`+ `x` to exit and press `y`, then name the file `docker-compose.yml` and press `y` to overwrite the current version.

---

## Start the Execution Node Service
Depending on which execution node you have chosen, start the `geth_docker` | `nethermind_docker` | `besu_docker` service:

```
sudo docker-compose up -d geth_docker
```

<!-- prettier-ignore-begin -->
!!! tip
    Replace the `geth_docker` commands with the name of the Execution Node client you are running.
    *Nethermind Example:* `sudo docker-compose up -d nethermind_docker`
    *Besu Example:* `sudo docker-compose up -d besu_docker`
<!-- prettier-ignore-end -->

If it has initiated properly, it will download the image and return: `Creating geth_docker ... done`

Check the logs and ensure it is syncing by using `docker logs`.
```
sudo docker logs geth_docker
```

<!-- prettier-ignore-begin -->
!!! tip
    You can follow the output logs live by using the `-f` flag with the `docker logs` command.
    Example:
    `sudo docker logs -f geth_docker`
<!-- prettier-ignore-end -->

When verified that everything is working properly, exit the log by pressing `CTRL` + `C`.

Your execution (eth1) node is now running on a http server at `http://127.0.0.1:8545` and you have configured a JWT secured authentication RPC at `http://127.0.0.1:8551`. 

<!-- prettier-ignore-begin -->
!!! warning
    **Execution Syncing...** Lodestar will not be able to validate any blocks from the execution client and will remain "optimistic" until the execution client is fully synced. You will see `execution: syncing(blockhash)` in your Lodestar beacon node.
<!-- prettier-ignore-end -->

---

## Start Lodestar Beacon Node & Metrics Services

To startup the remaining services with or without metrics (beacon node, prometheus and grafana) use one of the following commands:

Startup beacon node with metrics:
```
sudo docker-compose up -d
```
Or startup beacon node without metrics:
```
sudo docker-compose up -d beacon_node
```

<!-- prettier-ignore-begin -->
!!! tip
    If you do not plan on running metrics and do not want to collect them for hardware efficiency, you can remove the `--metrics` flag on line 22 from your `docker-compose.yml` file.
<!-- prettier-ignore-end -->

If it has initiated properly, it will download the images, create the containers and return: 
```
Creating lodestar_beacon_node_1 ... done
Creating lodestar_prometheus_1 ... done
Creating lodestar_grafana_1 ... done
```

We can confirm they are all running by using the `docker ps` command:
```
sudo docker ps
```

You will see multiple containers. Each named 
```
lodestar_beacon_node_1
lodestar_grafana_1
lodestar_prometheus_1
nethermind_docker OR besu_docker OR geth_docker
```

As long as the **STATUS** is not constantly restarting, your containers are up and running properly.

<!-- prettier-ignore-begin -->
!!! tip
    To see the logs from a specific container, use the command:
    ```
    sudo docker logs <ContainerName>
    ```

    To see the latest 10 lines of logs from every container, use the command:
    ```
    sudo docker-compose logs --tail="10"
    ```

    To follow the live output of a specific container, use the command:
    ```
    sudo docker logs -f <ContainerName>
    ```
    To exit the log, press `CTRL` + `C`.

    To follow the live output of all containers, starting from the last 10 lines, use the command:
    ```
    sudo docker-compose logs -f --tail="10"
    ```
    To exit the log, press `CTRL` + `C`.

When your beacon node is fully synced, the logs will display a line similar to the one below.
```
info: Synced - slot: 4595394 - head: 4595394 0xc997…00ac - execution: valid(0x06bc…3d6e) - finalized: 0x6bc5…e15a:143604 - peers: 54
```

### Access your metrics dashboard
> You can skip this step if you did not enable metrics.

To check the metrics, you will need to know the IP address of your node within your network. You can check by using:
```
hostname -I
```

Use your internet browser and access the Grafana metrics dashboard at port 3000.

<!-- prettier-ignore-begin -->
!!! tip
    Replace ``<IPaddress>`` with the address returned from the previous command.
    ```
    http://<IPaddress>:3000
    ```
<!-- prettier-ignore-end -->

Log in to your Grafana dashboard and use the default credentials to change your password:
```
Username: admin
Password: admin
```

On your left-hand side menu bar, navigate to Dashboards > Browse.

![](https://i.imgur.com/23WaHiK.png)

Select Lodestar for our default Lodestar dashboard.

![](https://i.imgur.com/rt1NytR.png)

Your metrics dashboard should now be pulling in data from your Lodestar beacon node.

![](https://i.imgur.com/1jR4F67.png)

When your beacon node is fully synced, the dashboard will display: `Sync status: Synced`. 

---

## Setup Validators for Lodestar

> **OPTIONAL:** Skip these following steps and proceed to [Final Remarks, Next Steps & Appendix](https://hackmd.io/@philknows/rJceRAHvY) if you are not running a validator.

When using Ethereum's [Staking Deposit CLI](https://github.com/ethereum/staking-deposit-cli) tool or the [Wagyu Key Generator](https://wagyu.gg/), you generated one or many keystore files that stores your validator signing keys. We will now import those keystores into the Lodestar validator client. If you generated your keystores on another device, make sure to copy them to your staking machine first. Keystore files normally starts with keystore-m and ends with .json extension.

Your keystore file(s) should be in a located in a known directory. Make sure to insert your own path for where your keystore files are located. There should not be any `keystore-directory` literal.

We will create a keystores folder in our Lodestar directory.
```
mkdir ~/lodestar/keystores
```

### Copy the Validator Keys from your USB to your Lodestar keystores directory
Configure the Lodestar validator by importing the validator keys.

> **OPTIONAL:** If you created your validator keystores on this local machine, skip this step. 

If you generated the validator `keystore-m.json` file(s) on a machine other than your Ubuntu server you will need to **copy** the file(s) over to your Lodestar keystores directory. You can do this using a USB drive (if your server is local).

To mount a USB drive into your server, physically insert your USB drive, then find the path to it.

```
sudo fdisk -l
```

Look for your USB Drive and confirm the information before proceeding.

![](https://i.imgur.com/HdyXS6D.png)

You will need the device path before continuing. In this example, the path is `/dev/sda1`.

Create a new folder under `/media` called `usb-stick` then mount your USB drive onto it. Ensure you replace `<USBDevicePath>` with the specific device path to your USB.

```
sudo mkdir /media/usb-stick
```
```
sudo mount <USBDevicePath> /media/usb-stick
```

Enter your `/media/usb-stick` path and ensure you can see the contents within it.

```
cd /media/usb-stick
```
```
ls
```

Locate your `validator_keys` folder generated from Part 1 and copy it to your Lodestar keystores directory. Insert the path to your `validator_keys` folder into `<ValidatorKeysFolderPath>`

```
sudo cp -a <ValidatorKeysFolderPath>/. ~/lodestar/keystores
```
```
cd ~/lodestar/keystores
```
```
ls
```

<!-- prettier-ignore-begin -->
!!! info
    If you have your `validator_keys` folder on your USB stick, you can use the following commands instead of the ones above:
    ```
    sudo cp -a /media/usb-stick/validator_keys/. ~/lodestar/keystores
    ```
    ```
    cd ~/lodestar/keystores
    ```
    ```
    ls
    ```
<!-- prettier-ignore-end -->

The contents inside your `validator_keys` folder should be now be visible in your Lodestar keystore directory.

If you have your `deposit_data` files within your Lodestar keystore directory, you should delete it or you may encounter errors when starting up the validator client. You should only have your `keystore-m.json` files here.

To remove any `deposit_data` files, you can use the `rm` command.

<!-- prettier-ignore-begin -->
!!! tip
    Replace `<NameOfDepositDataFile>` with the filename of your `deposit_data` JSON file.
<!-- prettier-ignore-end -->

```
sudo rm <NameOfDepositDataFile>
```

Use the `ls` command to ensure the `deposit_data` JSON file(s) are removed.

```
ls
```

Unmount your USB stick.

```
sudo umount <USBDevicePath>
```
You can now physically remove the USB key from your local server. Continue at the next step: **Configure Lodestar Validator Client.**

### Copy the Validator Keys from your local machine to your Lodestar keystores directory

> **OPTIONAL:** If you know how to copy keystore.json files to `~/lodestar/keystores` on your server, skip this step. 

Configure the Lodestar validator by importing the validator keys.

If you generated the validator `keystore-m.json` file(s) on the local Ubuntu staking server you will need to **copy** the file(s) over to your Lodestar keystores directory. You can do this using the `cp` command which follows the standard `sudo cp <FileFromDirectoryPath> <ToDirectoryPath>`

Example:
```
sudo cp /home/user/Downloads/eth2deposit-cli-256ea21-linux-amd64/validator_keys/keystore-m.json /home/user/lodestar/keystores 
```

If you have your `deposit_data` files within your Lodestar keystore directory, you should delete it or you may encounter errors when starting up the validator client. You should only have your `keystore-m.json` files here.

To remove any `deposit_data` files, you can use the `rm` command.

<!-- prettier-ignore-begin -->
!!! tip
    Replace `<NameOfDepositDataFile>` with the filename of your `deposit_data` JSON file.
<!-- prettier-ignore-end -->

```
sudo rm <NameOfDepositDataFile>
```

Use the `ls` command to ensure the `deposit_data` JSON file(s) are removed.

```
ls
```

## Configure Lodestar Validator Client

### Create password file
You will now configure the validator client to import your keystore password. We will make a folder called `keystores_password` and a text file containing the keystore password.
```
cd ~/lodestar
```
```
mkdir secrets
```
```
nano ~/lodestar/secrets/password.txt
```
Type your keystore password (the password you used to encrypt the .json files).

When you're done creating this file, press `CTRL`+ `x` to exit and press `y` to save.

### Modify Validator Client Docker Compose file
We will recreate the docker-compose.validator.yml file which configures your Lodestar validator docker instance. These parameters will allow you to run the Lodestar validator client through your machine’s host network and connect to your local Ethereum Consensus (eth2) Lodestar beacon node.

Create a new text file with nano.
```
cd ~/lodestar
```
```
nano
```

<!-- prettier-ignore-begin -->
!!! tip
    YAML files are sensitive to indentations. Copy the lines **exactly** as seen below.
<!-- prettier-ignore-end -->

``` yaml linenums="1"
version: "3.4"
services:
  validator:
    image: chainsafe/lodestar:latest
    restart: always
    volumes:
      - validator:/data
      - logs:/logs
      - ./keystores:/keystores
      - ./secrets:/secrets
    env_file: .env
    command: validator --dataDir /data --importKeystores /keystores --importKeystoresPassword /secrets/password.txt --server http://0.0.0.0:9596 --logFile /logs/validator.log --logFileLevel debug --logFileDailyRotate 5 --suggestedFeeRecipient 0x0000000000000000000000000000000000000000
    # A validator client requires very little memory. This limit allows to run the validator
    # along with the beacon_node in a 8GB machine and be safe on memory spikes.
    environment:
      NODE_OPTIONS: --max-old-space-size=2048
    network_mode: host

volumes:
  validator:
  logs:
```

Continue below to add a feeRecipient to the above script.

### Modify `suggestedFeeRecipient` address to your validator
Post-Merge Ethereum requires validators to set a **Fee Recipient** which allows you to receive priority fees when proposing blocks. If you do not set this address, your priority fees will be sent to the [burn address](https://etherscan.io/address/0x0000000000000000000000000000000000000000).

Configure your validator client's fee recipient address by using the `--suggestedFeeRecipient` flag. Ensure you specify an Ethereum address you control. Add/modify this flag to the validator `command` line on Line 12.

An example of a fee recipient set with the address `0xB7576e9d314Df41EC5506494293Afb1bd5D3f65d` would add the following flag to the validator configuration: `--suggestedFeeRecipient 0xB7576e9d314Df41EC5506494293Afb1bd5D3f65d`.

When you're done creating this file, press `CTRL`+ `x` to exit and press `y`, then name the file `docker-compose.validator.yml` and press `y` to overwrite the current version.

---

## Start the Lodestar Validator Client

To start the validator client, ensure you are in your Lodestar directory in the command line terminal:

```
cd ~/lodestar
```
```
sudo docker-compose -f docker-compose.validator.yml up -d
```

Once it successfully builds the validator client container you will see the return `... done` on your new Docker container containing your validator!

Check that all containers are working properly.
```console
sudo docker ps
```
![](https://i.imgur.com/mUkaIgW.png)

If one of the containers continuously reboot, there is an issue and you will need to diagnose them from their logs. You can access these logs with `docker logs`

```
sudo docker logs <ContainerId>
```

<!-- prettier-ignore-begin -->
!!! note
    If you see this within your validator's logs:
    `info: Node is syncing - Error on getProposerDuties - Service Unavailable: Node is syncing`

This is **normal** if your beacon node has not fully synced to the head of the network yet.
<!-- prettier-ignore-end -->

You can also check that you validators are connected through your Grafana dashboard under "Validators connected".

![](https://i.imgur.com/vCjGcVK.png)


Rebooting your server should autostart all of the containers. Check by rebooting your server, then checking the docker processes.

```
sudo reboot
```

```
sudo docker ps
```

---

## Final Notes
You should now have a functioning Ubuntu based staking server set up with Docker containers.
Funding your validator keys are out of scope for the Lodestar v3 Setup Guide. 

It is recommended that you test your setup to restart containers upon a reboot of your server.

---

## Appendix A - Expanding the Logical Volume
There are cases where Ubuntu is provisioning only 200GB of a larger SSD causing users to run out of disk space when syncing their Eth1 node. The error message is similar to:

`Fatal: Failed to register the Ethereum service: write /var/lib/goethereum/geth/chaindata/383234.ldb: no space left on device`

To address this issue, assuming you have a SSD that is larger than 200GB, expand the space allocation for the LVM by following these steps:

```
sudo lvdisplay  <-- Check your logical volume size
sudo lvm 
lvextend -l +100%FREE /dev/ubuntu-vg/ubuntu-lv
lvextend -l +100%FREE -r /dev/ubuntu-vg/ubuntu-lv
exit
sudo resize2fs /dev/ubuntu-vg/ubuntu-lv
df -h  <-- Check results
```

That should resize your disk to the maximum available space.

If you need support, please check with the [ChainSafe Discord](https://discord.gg/642wB3XC3Q) under the #:star2:-lodestar-general channel. 

## Appendix B - Update Docker images

### Update Execution Layer client
<!-- prettier-ignore-begin -->
!!! tip
  In the following steps, replace `geth_docker` with the proper execution layer client you are running. E.g. `nethermind_docker` or `besu_docker`
<!-- prettier-ignore-end -->

Navigate to your Lodestar directory.
```
cd ~/lodestar
```

Pull the latest image from Docker Hub. Run one of the following commands pertaining to your execution client:
```
sudo docker pull ethereum/client-go:stable
sudo docker pull hyperledger/besu:develop
sudo docker pull nethermind/nethermind:latest
```

Stop and discard the old execution layer container.
```
sudo docker stop geth_docker
sudo docker rm geth_docker
```

Startup the new container with the updated image.
```
sudo docker-compose up -d geth_docker
```

Check the status of your container. It should not consistently restart.
```
sudo docker ps
```

Check the logs of your container and ensure it is functioning properly.
```
sudo docker logs geth_docker
```

### Update Lodestar
Navigate to your Lodestar directory.
```
cd ~/lodestar
```

Pull the latest image from Docker Hub:
```
sudo docker pull chainsafe/lodestar:latest
```

Stop and remove your validator container.
```
sudo docker stop lodestar_validator_1
sudo docker rm lodestar_validator_1
```

Stop and remove your beacon node container.
```
sudo docker stop lodestar_beacon_node_1
sudo docker rm lodestar_beacon_node_1
```

Startup the new container with the updated image.
```
sudo docker-compose up -d beacon_node
sudo docker-compose -f docker-compose.validator.yml up -d
```

Check the status of your containers. It should not consistently restart.
```
sudo docker ps
```

Check the logs of your containers and ensure it is functioning properly.
```
sudo docker logs lodestar_beacon_node_1
sudo docker logs lodestar_validator_1
```

## Full Disclaimer
This article (the guide) is for informational purposes only and does not constitute professional advice. The author does not warrant or guarantee the accuracy, integrity, quality, completeness, currency, or validity of any information in this article. All information herein is provided “as is” without warranty of any kind and is subject to change at any time without notice. The author disclaims all express, implied, and statutory warranties of any kind, including warranties as to accuracy, timeliness, completeness, or fitness of the information in this article for any particular purpose. The author is not responsible for any direct, indirect, incidental, consequential or any other damages arising out of or in connection with the use of this article or in reliance on the information available on this article. This includes any personal injury, business interruption, loss of use, lost data, lost profits, or any other pecuniary loss, whether in an action of contract, negligence, or other misuse, even if the author has been informed of the possibility.