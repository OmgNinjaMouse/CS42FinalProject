function b2c (bool_val) {
    return (bool_val > 0) ? "fire" : "idle";
}

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
        /**/
        let ml_options = {
            inputs: (this.entry_size),
            outputs: [ 
                "action"
            ],
            task: 'classification',
            hiddenUnits: 128,
            modelUrl: "model/model.json",
        }
        /**/
        // debug: 'true'

        /**
        let ml_options = {
            task: 'classification',
            debug: true
          }
        **/

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
        console.log(history_log);
        this.history = history_log;
    }


    train (callback) {
        let stats = {};
        let total_stats = 0;

        if (this.history.length < (this.entry_depth * 2)) {
            console.log("Insufficient data samples: " + this.history.length);
        } else {
            console.log("Compiling Model");
            this.ml_model.compile();

            console.log("Constructing Training Data ");

            /* Loop through the history with a sliding start end window */
            let h_index = 0;
            while (h_index < (this.history.length - 1)) {
                let log_entry = this.history[h_index];
                let input_data = [
                    log_entry.ball_x,
                    log_entry.ball_y,
                    log_entry.ball_vx,
                    log_entry.ball_vy,
                    log_entry.spring_y,
                    log_entry.flip_left,
                    log_entry.flip_right
                ];
                let output_data = {
                    "action": this.history[h_index+1].action
                }
                this.ml_model.addData(input_data, output_data);

                //console.log(log_entry);

                if (stats[log_entry.action] == undefined) {
                    stats[log_entry.action] = 0;
                } else {
                    stats[log_entry.action]++;
                }
                total_stats++;
                h_index++;
            }
        }
        
        let options = {
            epoch: 250,
            batchSize: 30
        }

        console.log("Normalizing input data");
        this.ml_model.normalizeData();

        console.log("Adjusting ML Model.");
        this.ml_model.train(options, () => { 
            console.log("Done Training. event count:" + total_stats);
            console.log(stats);
            if (callback != undefined) {
                callback();
            }
        });
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

    predict (log_entry, callback) {
        //console.log("Attempting prediction.");

        /* Create an opaque by vectorizing the input data within the window */
        let input_data = [
            log_entry.ball_x,
            log_entry.ball_y,
            log_entry.ball_vx,
            log_entry.ball_vy,
            log_entry.spring_y,
            log_entry.flip_left,
            log_entry.flip_right
        ];

        //console.log("Running ML model");
        //console.log(input_data);
        this.ml_model.classify(input_data, (error, results) => {
            //console.log(results);
            callback(results);
        });
    }
}