---
title: Setting Up LaTex
date: 2020-12-03
tags: [tutorial]
---

## What is LaTex

LaTex is a typesetting program, which has some predefined rules for setting up and formatting margin, header, sections,titles etc. and allows writers to focus on content, rather than worrying about design of the document. To quote from their [website](https://www.latex-project.org/about/) :

>LaTeX is not a word processor! Instead, LaTeX encourages >authors not to worry too much about the appearance of their >documents but to concentrate on getting the right content.
>[...]
>To produce [...] in most typesetting or word-processing systems, the author would have to decide what layout to use, so would select (say) 18pt Times Roman for the title, 12pt Times Italic for the name, and so on. This has two results: authors wasting their time with designs; and a lot of badly designed documents!

As someone who is not much good in designing, I completely agree with this :smile: I started looking in LaTex for the same reason, I had to write some reports for my projects, and I am not much good in designing, resulting in a rather badly designed report document. LaTex Allows us to define various parts of the document by use of 'macros', and according to those, it typesets the document, which can then be rendered to pdf, html, and others.

## What is Tex , then?
Tex is the original, core program, based on which LaTex defines its macros. Tex provides the tools to typeset the document, and LaTex gives writer various macros to work with, and itself is written using Tex - [ref stackexchange](https://tex.stackexchange.com/questions/49/what-is-the-difference-between-tex-and-latex/315#315).

## How to Say that again?
LaTex is pronounced as
>LaTeX, which is pronounced «Lah-tech» or «Lay-tech» (to rhyme with «blech» or «Bertolt Brecht»)

As taken from its website.
It is pronuced as a -kh and not -ks as in text, becuase the X is not a X, but the greek later chi - [ref stackexchange](https://tex.stackexchange.com/questions/17502/what-is-the-correct-pronunciation-of-tex-and-latex/17509#17509)

## What can one do with LaTex

As said, LaTex is a typesetting system, which means it can be used to write documents in a good design. One can write articles, papers, make slides and slideshows, CV and also write books using LaTex.

## Setting up LaTex

### For Windows and MacOS, as well as using online
please check the official guide here : https://www.latex-project.org/get/ , as I do not use these OS :sweat_smile:

### For Linux
I am using Ubuntu, and the process shown will be based on that, but similar process should work on other distributions as well.

Many of the search answers tell to install texlive-full package, which contains all packages related to Tex. This has downside that the download bundle is of ~ 2 GB, and it occupies ~ 5 GB after installing, and it also contains all extra packages that one may not use, such as support for Japanese, Arabic, Cyrillic languages and other extra things.

Refer to this answer, for a better analysis of what different packages actually contain - [ref stackexchange](https://tex.stackexchange.com/questions/245982/differences-between-texlive-packages-in-linux/504566#504566)

I am installing texlive-latex-extra, with texlive-science and texlive-pictures. For a complete list of available packages, you can run 

```bash
sudo apt search latex
```
which will give complete list of available packages. To check size of installation and which extra packages will be install, run 

```bash
sudo apt-get install packagename
```

This should display names of packages to be installed and size of download, and size on disk after installation, type n and enter to cancel actual installation.

To install above mentioned packages, I used
```bash
sudo apt-get install texlive-latex-extra texlive-science texlive-pictures
```

As I use vs code as my editor, I'll also install the LaTex Workshop extension : https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop. For this to work, One also needs to install texlive-extra-utils and latexmk:
```bash
sudo apt-get install texlive-extra-utils latexmk
```
If you are using a different editor, you may not need to install this. This extension auto compiles documents to pdf on save (One can change this), as well as display the generated pdf in the vs code itself.

For a very basic document:
```latex
\documentclass{article}
\begin{document}
\title{Introduction To \LaTeX}
\author{YJDoc2}
\date{}
\maketitle
Hello \LaTeX World!
\end{document}
```
It shows as this :
![Generated Document](https://dev-to-uploads.s3.amazonaws.com/i/sp892p0vlzn5kg3szyzi.png)

This is the basic setup for the LaTex use.

Thank You!

Notes :
* For a quick guide of various macros and uses of LaTex, check out the [wikibook](https://en.wikibooks.org/wiki/LaTeX).
