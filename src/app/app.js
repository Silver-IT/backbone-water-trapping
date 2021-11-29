$(function(){
    // jQuery: $, Lodash: _, JointJS: joint
    const defaultValues = {
        blockSize: 60,
        maxHeight: 10,
        minLength: 4,
        maxLength: 15,
    };

    const WaterPoolModel = Backbone.Model.extend({
        defaults: {
            minLength: defaultValues.minLength,
            maxLength: defaultValues.maxLength,
            maxHeight: defaultValues.maxHeight,
            heights: [4, 2, 0, 3, 2, 5],
            length: 6,
        },
        refresh: function() {
            const lengthDifference = this.get('maxLength') - this.get('minLength');
            const nLength = this.get('minLength') + parseInt(lengthDifference * Math.random());
            this.set('nLength', nLength);
            const heights = [], maxHeight = this.get('maxHeight');
            for (let i = 0; i < nLength; i++) {
                heights.push(parseInt(maxHeight * Math.pow(Math.random(), 2)));
            }
            this.set('heights', heights);
        },
        trap: function() {
            const heights = this.get('heights');
            const n = heights.length;
            if (n < 3) return 0;
    
            let leftMax = [0], rightMax = [0];
    
            for(let i = 1; i < n - 1; i++)
            {
                leftMax.push(Math.max(leftMax[i - 1], heights[i - 1]));
                rightMax.unshift(Math.max(rightMax[0], heights[n - i]));
            }
            leftMax.push(0);
            rightMax.unshift(0);
    
            let waterLevels = [0];
            for (let i = 1; i < n - 1; i++)
                waterLevels.push(Math.max(0, Math.min(leftMax[i], rightMax[i]) - heights[i]));
            waterLevels.push(0);

            return { waterLevels, trap: waterLevels.reduce((a, b) => a + b)};
        }
    });

    const WaterPoolView = Backbone.View.extend({
        template: Handlebars.compile($("#water-pool-template").html()),
        model: new WaterPoolModel(),
        events: {
            "click #btn-generate": "refreshWaterPoolModel"
        },
        refreshWaterPoolModel: function() {
          this.model.refresh();
        },
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);

            this.graph = new joint.dia.Graph;
            this.paper = new joint.dia.Paper({
                el: $('#water-pool').first(),
                model: this.graph,
                width: 150 + defaultValues.blockSize * defaultValues.maxLength,
                height: 150 + defaultValues.blockSize * defaultValues.maxHeight,
                gridSize: 1,
                interactive: false
            });

            this.render();
        },
        drawLines: function() {
            var ptCenter = new joint.shapes.standard.Circle();
            ptCenter.position(50, 700);
            ptCenter.resize(0, 0);
            ptCenter.addTo(this.graph);

            var ptTop = ptCenter.clone();
            ptTop.translate(0, -1 * (defaultValues.maxHeight + 1) * defaultValues.blockSize);
            ptTop.addTo(this.graph);

            var lnVertical = new joint.shapes.standard.Link();
            lnVertical.source(ptCenter);
            lnVertical.target(ptTop);
            lnVertical.addTo(this.graph);

            var ptRight = ptCenter.clone();
            ptRight.translate((defaultValues.maxLength + 1) * defaultValues.blockSize, 0);
            ptRight.addTo(this.graph);

            var lnHorizontal = lnVertical.clone();
            lnHorizontal.target(ptRight);
            lnHorizontal.addTo(this.graph);
        },
        drawPoints: function() {
            const maxLength = this.model.get('maxLength');
            const maxHeight = this.model.get('maxHeight');

            const ptCenter = new joint.shapes.standard.Rectangle();
            ptCenter.position(50, 715);
            ptCenter.resize(0, 0);
            ptCenter.attr({ label: { text: '(0, 0)' } });
            ptCenter.addTo(this.graph);

            for (let i = 1; i <= maxLength; i++) {
                const point = ptCenter.clone();
                point.position(50 + i * defaultValues.blockSize, 715);
                point.attr({ label: { text: `${i}` } });
                point.addTo(this.graph);
            }
            for (let j = 1; j <= maxHeight; j++) {
                const point = ptCenter.clone();
                point.position(40, 700 - defaultValues.blockSize * j);
                point.attr({ label: { text: `${j}` } });
                point.addTo(this.graph);
            }
        },
        drawBlocks: function() {
            const heights = this.model.get('heights');
            const waterLevels = this.model.trap().waterLevels;
            const blockModel = new joint.shapes.standard.Rectangle();
            blockModel.resize(60, 60);
            blockModel.attr({ body: { fill: 'gray' } });
            const waterModel = blockModel.clone();
            waterModel.attr({ body: { fill: '#2178d5' } });

            for (let i = 0; i < heights.length; i++) {
                const height = heights[i];
                const waterLevel = waterLevels[i];
                if (height) {
                    for (let j = 0; j < height; j++) {
                        const block = blockModel.clone(0);
                        block.position(50 + 60 * i, 700 - 60 * (j + 1));
                        block.addTo(this.graph);
                    }   
                }
                for (let k = 0; k < waterLevel; k++) {
                    const water = waterModel.clone(0);
                    water.position(50 + 60 * i, 700 - 60 * height - (k + 1) * 60);
                    water.addTo(this.graph);
                }
            }
        },
        drawDiagram: function() {
            this.graph.clear();
            this.drawLines();
            this.drawPoints();
            this.drawBlocks();
        },
        render: function () {
            this.$el.html(this.template({
                heights: `[${this.model.get('heights').join(', ')}]`,
                trap: this.model.trap().trap
            }));
            this.drawDiagram();
        }
    });
    
    const AppRouter = Backbone.Router.extend({
        routes: {
            '': 'waterPoolRoute',
        },
        waterPoolRoute: function () {
            $("#water-pool-description").html(new WaterPoolView().el);
        },
    });
    
    var appRouter = new AppRouter();
    Backbone.history.start();
})