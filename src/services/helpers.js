import dayjs from "dayjs";
import { SystemService } from "./systemService";

export const Helpers = {
  flattenProductionData: async (categories) => {
    // console.log(categories);

    // const batch = db.batch();
    const createdDocs = [];
    // Keep track of processed document IDs for cleanup
    const processedIds = new Set();

    // for (const category of categories) {
    for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
      const { key, name, phase, description, _steps } = categories[categoryIndex];
      const category = categories[categoryIndex];

      for (let stepIndex = 0; stepIndex < _steps.length; stepIndex++) {
        const step = _steps[stepIndex];

        for (let costIndex = 0; costIndex < step._costing.length; costIndex++) {
          const cost = step._costing[costIndex];

          // Create document data combining category, step, and cost info
          const docData = {
            category_index: categoryIndex,
            key,
            name,
            phase,
            description,
            // Step data
            step_index: stepIndex,
            step_name: step.step_name,
            duration: [step.duration[0].valueOf(), step.duration[1].valueOf()],
            created_at: SystemService.generateTimestamp(),
            updated_at: SystemService.generateTimestamp(),
            // Cost data
            cost_index: costIndex,
            amount: cost.amount,
            interval: cost.interval,
            cost_name: cost.cost_name,
            used_per_hactor: cost.used_per_hactor,
            used_per_hactor_unit: cost.used_per_hactor_unit,
            overal_cost: cost.overal_cost,
            total_unit_cost: cost.total_unit_cost,
          };
          try {
            // Check if document already exists
            if (category.key !== 'null' && stepIndex === 0 && costIndex === 0) {
              // Update existing main document
              processedIds.add(category.key);
            } else {
              // Create new document
              createdDocs.push({ data: docData });
            }

          } catch (error) {
            console.error('Error updating document:', error);
          }
        }
      }
    }
    return { createdDocs, processedIds };
  },
  flatNestedData: async (data) => {
    // const batch = db.batch();
    const toAdd = [];
    // Keep track of processed document IDs for cleanup
    const toUpdate = [];

    for (let categoryIndex = 0; categoryIndex < data.length; categoryIndex++) {
      const { name, phase, description, _steps } = data[categoryIndex];

      for (let stepIndex = 0; stepIndex < _steps.length; stepIndex++) {
        const step = _steps[stepIndex];

        for (let costIndex = 0; costIndex < step._costing.length; costIndex++) {
          const cost = step._costing[costIndex];

          // Create document data combining category, step, and cost info
          const docData = {
            category_index: categoryIndex,
            key: cost.key,
            name,
            phase,
            description,
            // Step data
            step_index: stepIndex,
            step_name: step.step_name,
            duration: [step.duration[0].valueOf(), step.duration[1].valueOf()],
            created_at: SystemService.generateTimestamp(),
            updated_at: SystemService.generateTimestamp(),
            // Cost data
            cost_index: costIndex,
            amount: Number(cost.amount),
            interval: Number(cost.interval),
            cost_name: cost.cost_name,
            used_per_hactor: Number(cost.used_per_hactor),
            used_per_hactor_unit: cost.used_per_hactor_unit,
            overal_cost: Number(cost.overal_cost),
            total_unit_cost: Number(cost.total_unit_cost),
          };
          try {
            // Check if document already exists
            if (docData.key !== "null") {
              // Update existing main document
              toUpdate.push({ data: docData });
            } else {
              // Create new document
              toAdd.push({ data: docData });
            }

          } catch (error) {
            console.error('Error updating document:', error);
          }
        }
      }
    }
    return { toAdd, toUpdate };
  },
  nestProductionData: async (categories) => {
    // Helper function to group data by phase, name, and description
    const groupedCategories = {};

    categories.forEach(doc => {
      const { key, phase, name, description, step_name, duration, ...costData } = doc;

      // Convert duration timestamps to ISO strings
      const formattedDuration = duration.map(ts => new Date(ts).toISOString());

      // Group by phase, name, and description
      const categoryKey = `${phase}-${name}-${description}`;
      if (!groupedCategories[categoryKey]) {
        groupedCategories[categoryKey] = {
          key,
          phase,
          name,
          description,
          _steps: [],
        };
      }

      // Find or create the step
      let step = groupedCategories[categoryKey]._steps.find(s => s.name === step_name);
      if (!step) {
        step = { name: step_name, duration: formattedDuration, _costing: [] };
        groupedCategories[categoryKey]._steps.push(step);
      }
      const _costing = {
        key: key,
        amount: costData.amount,
        interval: costData.interval,
        used_per_hactor: costData.used_per_hactor,
        used_per_hactor_unit: costData.used_per_hactor_unit,
        overal_cost: costData.overal_cost,
        total_unit_cost: costData.total_unit_cost,
        cost_name: costData.cost_name,
      }
      // comments
      if (costData.comment) {
        _costing.subject = costData.subject;
        _costing.comment = costData.comment;
        _costing.actual_amount = costData.actual_amount;
        _costing.file_url = costData.file_url;
        _costing.updated_at = costData.updated_at;  
      }
      // Add costing to the step
      step._costing.push(_costing);
    });

    // Convert grouped categories back to an array
    return Object.values(groupedCategories);
  },
  transformFormData: (values) => {
    const result = [];
    const timestamp = Date.now();

    values.categories.forEach((category, categoryIndex) => {
      category._steps.forEach((step, stepIndex) => {
        step._costing.forEach((cost, costIndex) => {
          result.push({
            data: {
              name: values.name,
              phase: values.phase,
              description: values.description,
              category_index: categoryIndex,
              category_name: category.name,
              category_description: category.description,
              step_index: stepIndex,
              step_name: step.name,
              duration: step.duration.map(date => dayjs(date).valueOf()),
              created_at: timestamp,
              updated_at: timestamp,
              cost_index: costIndex,
              amount: cost.amount,
              interval: cost.interval,
              cost_name: cost.name,
              used_per_hactor: cost.used_per_hactor,
              used_per_hactor_unit: cost.used_per_hactor_unit,
              overal_cost: cost.overal_cost,
              total_unit_cost: cost.total_unit_cost
            },
            key: `${categoryIndex}-${stepIndex}-${costIndex}-${Math.random().toString(36).substring(2)}`
          });
        });
      });
    });

    return result;
  },

  reverseTransform: (transformedData) => {
    if (!transformedData.length) return null;
    const firstItem = transformedData[0].data;
    const result = {
      phase: firstItem.phase,
      name: firstItem.name,
      description: firstItem.description,
      _categories: []
    };
    const categoryMap = new Map();

    transformedData.forEach(({ data }) => {
      const categoryKey = `${data.category_index}`; // 0, 1, 2, ...

      // category with no steps
      if (!categoryMap.has(categoryKey)) {
        categoryMap.set(categoryKey, {
          name: data.category_name,
          description: data.category_description,
          phase: data.phase,
          _steps: []
        });
      }

      // get a 
      const category = categoryMap.get(categoryKey);
      const step = category._steps.find(s => s.name === data.step_name);

      if (!step) {
        category._steps.push({
          name: data.step_name,
          duration: data.duration.map(d => dayjs(d)),
          _costing: [{
            name: data.cost_name,
            amount: data.amount,
            interval: data.interval,
            used_per_hactor: data.used_per_hactor,
            used_per_hactor_unit: data.used_per_hactor_unit,
            overal_cost: data.overal_cost,
            total_unit_cost: data.total_unit_cost
          }]
        });
      } else {
        step._costing.push({
          name: data.cost_name,
          amount: data.amount,
          interval: data.interval,
          used_per_hactor: data.used_per_hactor,
          used_per_hactor_unit: data.used_per_hactor_unit,
          overal_cost: data.overal_cost,
          total_unit_cost: data.total_unit_cost
        });
      }
    });

    result._categories = Array.from(categoryMap.values());
    return result;
  }

}