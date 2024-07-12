---
title: Project Showcase
date: 2024-06-12 17:15:10
description: Information about various projects I did - Youki, 8086 emulator, pcb-rs etc.
---

# Project Showcase
 
---

## Youki

__Youki__ is a low-level container runtime, written in Rust. It provides functionality similar to runc or crun, but has some additional features such as native support for WASM containers, dedicated libraries for process containerisation etc.

I have contributed to Youki for 2+ years, and am currently one of the project maintainers. I have worked on implementing features to pass the Containerd test suite, making Youki suitable to run in an Kubernetes setup. One of my favorite contribution was implementing a {% link "dbus client" https://github.com/containers/youki/issues/2208 true "issue discussing the details"%} from scratch. The {% link "implementation" https://github.com/containers/youki/pull/2370 true "pr for the implementation" %} allowed Youki to run with Podman without root permissions.

You can find the github repo {% link "here" https://github.com/containers/youki true "youki github repo link" %}.

---

## Falkonry*

_*These are things I did at my job. I am not claiming to have ownership of any code etc. related to Falkonry._

While working as a dev-ops and systems engineer at Falkonry, I worked on maintaining the cloud setup and dev/prod deployments. I added various features to several in-house bots, and also triaged and fixed urgent product related issues. I also designed and implemented the CI setup to detect and notify vulnerabilities found via Trivy scanners to our communication channels.

Apart from that, I reduced the image size of the e2e testing harness by 80% and decreased its setup time by 45%. Afterwards, I took initiative and designed a custom harness over cypress, running the suites in parallel, which cut down total test run time by 70%. I also had experience setting up Prometheus and Grafana for better observability. 

---

## Intel 8086 Emulator

While doing an microprocessor course during pandemic, I couldn't find a good, multi-platform emulator for Intel 8086 chip needed for my labs. So I implemented this. After compiling to WASM, this now runs in the browser and does not require any installation. You can check it out {% link here https://yjdoc2.github.io/8086-emulator-web/ true "8086 emulator website link" %}.

Since then, the emulator was used by students across the world, and I got several emails from college professors mentioning that they have been using this for their courses. This was quite unexpected for me, and helped me to see how my projects can help others as well.

You can check this project {% link here https://github.com/YJDoc2/8086-Emulator/ true "github repo 8086 emulator" %}. I also published a {% link "paper on this" https://ieeexplore.ieee.org/abstract/document/9824078 true "8086 paper abstract link" %} .


---

## PCB-rs

__pcb-rs__ is a rust library designed to easily write software-simulated-hardware. You can define the hardware components as rust structs, and define how they behave in a normal rust function. The library's proc-macros will generate the required scaffolding for running the simulations. You can also use WASM to run these in a browser {% link "like this" https://yjdoc2.github.io/pcb-rs-examples/ true "link to examples" %}.

I had fun writing the proc macros to generate the scaffolding here, and also learnt a lot about electronic components when implementing example usage. You can check out the library {% link here https://github.com/YJDoc2/pcb-rs/ true "library github repo" %}.

---

## Network Simulator

After working with ns2 for my course, I wanted a simpler and easier emulator to write network simulations. So I wrote one. This runs in browser, and allows assigning JS functions to the nodes in simulation for the packet processing. This also allows exporting the simulations as JSON, so you can create and share the simulations. This was used for some demos related to distributed systems and cybersecurity courses.

You can find the project {% link here https://yjdoc2.github.io/Network-Simulator/ true "simulator website link" %} and the repo {% link here https://github.com/YJDoc2/Network-simulator true "network simulator repo" %}. I also published a {% link "paper on this" https://ieeexplore.ieee.org/abstract/document/9824937 true "network simulator abstract link" %} .

---

## C Examination Portal

I worked on backend and compilation implementation for a C language examination portal. I designed the compilation queue and subsequent result evaluation, which is used for evaluating the submitted program. After dockerising and deploying this on GCP, this was used for conducting an exam by my college.

---

Some other interesting projects -

- {% link "The Transpiler Project" https://github.com/YJDoc2/The-Transpiler-Project true "repo link for the transpiler project"%} : A custom language compiler which has support for classes and instance methods, but compiles it down to plain C. This was one of my first compiler implementations.

- {% link CodeBook https://github.com/YJDoc2/CodeBook% true "codebook repo link" %} : A social code problem sharing platform. You can post problems and follow others. This also has support for compiling, running and evaluating the code in backend, which inspired the implementation in the C examination portal.

- {% link FileStore https://github.com/YJDoc2/FileStore-Web-Project true "filestore repo link" %} : A file storage platform, allowing users to upload and share files. You can keep file private, or share them as public. Also has support for displaying some types of files directly in the browser.

- {% link "MapReduce with Docker" https://github.com/YJDoc2/MapReduce-with-Docker/ true "repo link for mapreduce docker" %} : A proof-of-concept implementation for Google's Map-Reduce algorithm, run via docker containers as individual nodes.

You can see all my projects {% link "on my github" https://github.com/YJDoc2?tab=repositories true "github link"%}.
