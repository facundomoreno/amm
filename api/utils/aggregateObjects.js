const getAggregationWithDailyAverages = (tokensList, initialDate) => {
  const aggObject = [
    {
      $unwind: "$tokensData",
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
          tokenAddress: "$tokensData.address",
          tokenName: "$tokensData.name",
          tokenTag: "$tokensData.tag",
        },
        averagePrice: { $avg: "$tokensData.price" },
      },
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
          },
        },
        tokensData: {
          address: "$_id.tokenAddress",
          name: "$_id.tokenName",
          tag: "$_id.tokenTag",
          price: "$averagePrice",
        },
      },
    },
    {
      $sort: { date: 1 },
    },
    {
      $group: {
        _id: "$date",
        tokensData: {
          $push: "$tokensData",
        },
      },
    },
    {
      $project: {
        date: "$_id",
        tokensData: {
          $map: {
            input: tokensList,
            as: "address",
            in: {
              $arrayElemAt: [
                "$tokensData",
                { $indexOfArray: ["$tokensData.address", "$$address"] },
              ],
            },
          },
        },
      },
    },
    {
      $sort: { date: 1 },
    },
  ];

  if (initialDate) {
    aggObject.unshift({
      $match: {
        date: { $gte: initialDate, $lt: new Date() },
      },
    });
  }

  return aggObject;
};

const getAggregationWithWeeklyValues = (tokensList, initialDate) => {
  const aggObject = [
    {
      $unwind: "$tokensData",
    },
    {
      $group: {
        _id: {
          week: { $isoWeek: "$date" }, // Grouping by ISO week number
          year: { $year: "$date" }, // Grouping by year
          tokenAddress: "$tokensData.address",
          tokenName: "$tokensData.name",
          tokenTag: "$tokensData.tag",
        },
        averagePrice: { $avg: "$tokensData.price" },
      },
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: {
              $dateFromParts: {
                isoWeekYear: "$_id.year",
                isoWeek: "$_id.week",
              },
            },
          },
        },
        tokensData: {
          address: "$_id.tokenAddress",
          name: "$_id.tokenName",
          tag: "$_id.tokenTag",
          price: "$averagePrice",
        },
      },
    },
    {
      $group: {
        _id: "$date",
        tokensData: {
          $push: "$tokensData",
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        date: "$_id",
        tokensData: {
          $map: {
            input: tokensList,
            as: "address",
            in: {
              $arrayElemAt: [
                "$tokensData",
                { $indexOfArray: ["$tokensData.address", "$$address"] },
              ],
            },
          },
        },
      },
    },
    {
      $sort: { date: 1 },
    },
  ];

  // if (initialDate) {
  //   aggObject.unshift({
  //     $match: {
  //       date: { $gte: initialDate, $lt: new Date() },
  //     },
  //   });
  // }

  return aggObject;
};
const getAggregationWithAllValues = (initialDate) => {
  return [
    {
      $match: {
        date: { $gte: initialDate, $lt: new Date() },
      },
    },
    {
      $sort: { date: 1 },
    },
  ];
};

const getMonthDiff = (d1, d2) => {
  if (d1 && d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
  } else {
    return 0;
  }
};

const getAggregationForSortType = (
  sortType,
  tokensList,
  initialDate,
  firstRecordedDate
) => {
  let aggregationObject = null;
  switch (sortType) {
    case "ONE_DAY":
    case "FIVE_DAYS":
    case "ONE_MONTH":
    case "SIX_MONTHS":
      aggregationObject = getAggregationWithAllValues(initialDate);
      break;

    case "THIS_YEAR":
      if (new Date().getMonth() >= 8) {
        aggregationObject = getAggregationWithDailyAverages(
          tokensList,
          initialDate
        );
      } else {
        aggregationObject = getAggregationWithAllValues(initialDate);
      }
      break;
    case "ONE_YEAR":
      if (getMonthDiff(firstRecordedDate, new Date()) >= 8) {
        aggregationObject = getAggregationWithDailyAverages(
          tokensList,
          initialDate
        );
      } else {
        aggregationObject = getAggregationWithAllValues(initialDate);
      }
      break;
    case "MAX":
      if (getMonthDiff(firstRecordedDate, new Date()) >= 8) {
        aggregationObject = getAggregationWithDailyAverages(tokensList, null);
      } else {
        aggregationObject = getAggregationWithAllValues(firstRecordedDate);
      }

      break;
  }

  return aggregationObject;
};

module.exports = { getAggregationForSortType, getMonthDiff };
