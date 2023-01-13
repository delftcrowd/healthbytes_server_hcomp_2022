# HealthBytes - Gesture Inputs for Crowdsourced Microtasks

This is the server side repository for the web application used in the 2022 Human Computation Conference
paper [*"Gesticulate for Health's Sake! Understanding the Trade-offs of Gestures as an Input Modality for Microtask 
Crowdsourcing"*]().

## Usage Instructions

### Start MongoDB server
```bash
cd /data/db # try this if `mongod` doesn't start the server directly
mongod
```

### Start dev server
```
yarn start:dev
```

## Front End Code

[comment]: <> (Use public repo link here once it is uploaded.)
The front end implementation for this web application can be found in the [healthbytes repository]().

## Further Information and Citation

[comment]: <> (Add DOI link here as well. Second link is for the OSF webpage.)

If you wish to read the paper in full, you can find it [here](). You can also find more information about the project,
including the surveys used, on the Open Science Framework website, []().

If you use any portion of this repository in your academic work, please include the following citation.

[comment]: <> (TODO: Update the below citation once we figure out what source it is: proceeding, misc, or article)

```
@article{allen2022gesticulate,
  title={Gesticulate for Health's Sake! Understanding the Trade-offs of Gestures as an Input Modality for Microtask Crowdsourcing},
  author={Allen, Garrett and Hu, Andrea and Gadiraju, Ujwal},
  journal={Proceedings of HCOMP},
  year={2022}
}
```

## License

This project is licensed under the terms of the [Apache-2.0 license](LICENSE.txt).