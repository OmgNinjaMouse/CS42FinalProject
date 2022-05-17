

class Brain {
    constructor (history_log) {
        this.init = this.init.bind(this);
        this.load = this.load.bind(this);
        this.setHistory = this.setHistory.bind(this);
        this.train = this.train.bind(this);
        this.predict = this.predict.bind(this);
        this.saveModel = this.saveModel.bind(this);
        this.saveData = this.saveData.bind(this);
        this.loadData = this.loadData.bind(this);

        this.entry_size = 7;
        this.history = history_log;
    }

    init () {
        let ml_options = {
            inputs: (this.entry_size),
            outputs: [ 
                "user_left_flip_up",
                "user_right_flip_up",
                "user_left_flip_dn",
                "user_right_flip_dn",
                "user_pull",
                "user_release",
                "user_left_tilt",
                "user_right_tilt"
            ],
            task: 'classification',
            hiddenUnits: 128,
            modelUrl: "model/model.json",
            debug: 'true'
        }

        this.ml_model = ml5.neuralNetwork(ml_options);
    }

    load () {
        const modelDetails = {
           model: "model/model.json",
           metadata: 'model/model_meta.json',
           weights: 'model/model.weights.bin'
        }
        this.ml_model.load("model/model.json", () => { 
            console.log("Model Load complete.");
            this.ml_model.compile();
        })

    }

    loadData () {
        this.ml_model.loadData("model/mldata.json", () => {
            console.log("Model Data load complete");
        });
    }

    setHistory(history_log) {
        this.history = history_log;
    }

    train () {
        if (this.history.length < (this.entry_depth * 2)) {
            console.log("Insufficient data samples: " + this.history.length);
        } else {
            console.log("Compiling Model");
            this.ml_model.compile();

            console.log("Constructing Training Data ");

            /* Loop through the history with a sliding start end window */
            let window_start = 0;
            let window_now = window_start + this.entry_depth;
            let window_end = window_now + this.entry_depth;
            while (window_end < this.history.length) {
                /* Create an opaque by vectorizing the input data within the window */
                let input_data = [];
                for (let i=window_start; i<window_now; i++) {
                    let entry = this.history[i];
                    Object.keys(entry).map( (key) => entry[key] ).forEach( (datum) => input_data.push(datum));
                }
    
                /* Convert the historical/future positional data into the solution set */
                let output_data = {
                    /* Blinky is the center of the window */
                    blinky_x: this.history[window_now-1].pac_x,
                    blinky_y: this.history[window_now-1].pac_y,
    
                    /* Pinky is the window + 5 */
                    pinky_x: this.history[window_now+this.entry_depth].pac_x,
                    pinky_y: this.history[window_now+this.entry_depth].pac_y,
    
                    /* Inky is the window - 5 */
                    inky_x: this.history[window_now-this.entry_depth].pac_x,
                    inky_y: this.history[window_now-this.entry_depth].pac_y,
    
                    /* Clyde is the window + 10 */
                    //clyde_x: this.history[window_end].pac_x,
                    //clyde_y: this.history[window_end].pac_y,
                };
    
                /* Add input and output to training set, and slide the window */
                //console.log(input_data);
                //console.log(output_data);
                this.ml_model.addData(input_data, output_data);
                window_start++;
                window_now = window_start + this.entry_depth;
                window_end = window_now + this.entry_depth;
            }
        }

        
        let options = {
            epoch: 250,
            batchSize: 30
        }

        console.log("Normalizing input data");
        this.ml_model.normalizeData();

        console.log("Adjusting ML Model.");
        this.ml_model.train(options, () => { console.log("Done Training.") });
    }

    saveModel () {
        this.ml_model.save("model", () => {
            console.log("Model Save Complete");
        });
    }

    saveData () {
        this.ml_model.saveData("mldata", () => {
            console.log("Data Save Complete");
        });
    }

    predict (callback) {
        //console.log("Attempting prediction.");
        let window_now = this.history.length;
        let window_start = window_now - this.entry_depth;

        if (window_start < 0) {
            /* Not enough data to predict anything */
            console.log("Insufficient data to predict");
            return;
        }

        /* Create an opaque by vectorizing the input data within the window */
        let input_data = [];
        for (let i=window_start; i<window_now; i++) {
            let entry = this.history[i];
            Object.keys(entry).map( (key) => entry[key] ).forEach( (datum) => input_data.push(datum));
        }

        //console.log("Running ML model");
        //console.log(input_data);
        this.ml_model.predict(input_data, (error, results) => {
            //console.log(results);
            callback(results);
        });
    }
}