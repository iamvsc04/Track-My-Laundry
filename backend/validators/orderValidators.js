const Joi = require("joi");

// Order creation validation schema
const createOrderSchema = Joi.object({
  serviceType: Joi.string()
    .valid("Wash & Fold", "Dry Clean", "Iron Only", "Premium Wash")
    .required()
    .messages({
      "any.required": "Service type is required",
      "any.only":
        "Service type must be one of: Wash & Fold, Dry Clean, Iron Only, Premium Wash",
    }),

  items: Joi.array()
    .items(
      Joi.object({
        type: Joi.string()
          .valid(
            "Shirt",
            "Pants",
            "Dress",
            "Suit",
            "Bedsheet",
            "Towel",
            "Curtain",
            "Other"
          )
          .required()
          .messages({
            "any.required": "Item type is required",
            "any.only": "Item type must be one of the allowed types",
          }),
        quantity: Joi.number().integer().min(1).max(100).required().messages({
          "number.base": "Quantity must be a number",
          "number.integer": "Quantity must be a whole number",
          "number.min": "Quantity must be at least 1",
          "number.max": "Quantity cannot exceed 100",
        }),
        service: Joi.string()
          .valid("Wash & Fold", "Dry Clean", "Iron Only", "Premium Wash")
          .required()
          .messages({
            "any.required": "Service is required",
            "any.only": "Service must be one of the allowed services",
          }),
        specialInstructions: Joi.string().max(500).optional().messages({
          "string.max": "Special instructions cannot exceed 500 characters",
        }),
        price: Joi.number().positive().max(10000).required().messages({
          "number.base": "Price must be a number",
          "number.positive": "Price must be positive",
          "number.max": "Price cannot exceed ₹10,000",
        }),
      })
    )
    .min(1)
    .max(50)
    .required()
    .messages({
      "array.min": "At least one item is required",
      "array.max": "Cannot exceed 50 items per order",
      "any.required": "Items are required",
    }),

  pickup: Joi.object({
    address: Joi.string().min(10).max(500).required().messages({
      "string.min": "Pickup address must be at least 10 characters",
      "string.max": "Pickup address cannot exceed 500 characters",
      "any.required": "Pickup address is required",
    }),
    date: Joi.date().min("now").required().messages({
      "date.base": "Pickup date must be a valid date",
      "date.min": "Pickup date cannot be in the past",
      "any.required": "Pickup date is required",
    }),
    timeSlot: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        "string.pattern.base": "Time slot must be in HH:MM format",
        "any.required": "Pickup time slot is required",
      }),
    instructions: Joi.string().max(300).optional().messages({
      "string.max": "Pickup instructions cannot exceed 300 characters",
    }),
  }).required(),

  delivery: Joi.object({
    address: Joi.string().min(10).max(500).required().messages({
      "string.min": "Delivery address must be at least 10 characters",
      "string.max": "Delivery address cannot exceed 500 characters",
      "any.required": "Delivery address is required",
    }),
    date: Joi.date().min("now").required().messages({
      "date.base": "Delivery date must be a valid date",
      "date.min": "Delivery date cannot be in the past",
      "any.required": "Delivery date is required",
    }),
    timeSlot: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        "string.pattern.base": "Time slot must be in HH:MM format",
        "any.required": "Delivery time slot is required",
      }),
    instructions: Joi.string().max(300).optional().messages({
      "string.max": "Delivery instructions cannot exceed 300 characters",
    }),
  }).required(),

  customerPreferences: Joi.object({
    detergentType: Joi.string()
      .valid("Regular", "Sensitive", "Eco-friendly", "Premium")
      .optional()
      .messages({
        "any.only": "Detergent type must be one of the allowed types",
      }),
    fabricSoftener: Joi.boolean().optional().messages({
      "boolean.base": "Fabric softener must be true or false",
    }),
    starchLevel: Joi.string()
      .valid("None", "Light", "Medium", "Heavy")
      .optional()
      .messages({
        "any.only": "Starch level must be one of the allowed levels",
      }),
    ironing: Joi.boolean().optional().messages({
      "boolean.base": "Ironing must be true or false",
    }),
  }).optional(),

  customerNotes: Joi.string().max(1000).optional().messages({
    "string.max": "Customer notes cannot exceed 1000 characters",
  }),

  isUrgent: Joi.boolean().optional().messages({
    "boolean.base": "Urgent flag must be true or false",
  }),

  priority: Joi.string()
    .valid("Low", "Normal", "High", "Urgent")
    .default("Normal")
    .optional()
    .messages({
      "any.only": "Priority must be one of the allowed levels",
    }),
});

// Order status update validation schema
const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "Pending",
      "Confirmed",
      "Picked Up",
      "Washing",
      "Ironing",
      "Ready for Pickup",
      "Out for Delivery",
      "Delivered",
      "Cancelled"
    )
    .required()
    .messages({
      "any.required": "Status is required",
      "any.only": "Status must be one of the allowed values",
    }),

  note: Joi.string().max(500).optional().messages({
    "string.max": "Status note cannot exceed 500 characters",
  }),

  location: Joi.string().max(200).optional().messages({
    "string.max": "Location cannot exceed 200 characters",
  }),

  estimatedTime: Joi.date().min("now").optional().messages({
    "date.base": "Estimated time must be a valid date",
    "date.min": "Estimated time cannot be in the past",
  }),

  staffNotes: Joi.string().max(500).optional().messages({
    "string.max": "Staff notes cannot exceed 500 characters",
  }),
});

// Order priority update validation schema
const updateOrderPrioritySchema = Joi.object({
  priority: Joi.string()
    .valid("Low", "Normal", "High", "Urgent")
    .required()
    .messages({
      "any.required": "Priority is required",
      "any.only": "Priority must be one of the allowed values",
    }),

  reason: Joi.string().max(300).optional().messages({
    "string.max": "Priority change reason cannot exceed 300 characters",
  }),
});

// Order cancellation validation schema
const cancelOrderSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required().messages({
    "string.min": "Cancellation reason must be at least 10 characters",
    "string.max": "Cancellation reason cannot exceed 500 characters",
    "any.required": "Cancellation reason is required",
  }),

  refundAmount: Joi.number().positive().max(10000).optional().messages({
    "number.base": "Refund amount must be a number",
    "number.positive": "Refund amount must be positive",
    "number.max": "Refund amount cannot exceed ₹10,000",
  }),
});

// NFC scan validation schema
const nfcScanSchema = Joi.object({
  nfcTag: Joi.string().min(5).max(100).required().messages({
    "string.min": "NFC tag must be at least 5 characters",
    "string.max": "NFC tag cannot exceed 100 characters",
    "any.required": "NFC tag is required",
  }),

  orderId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base": "Order ID must be a valid MongoDB ObjectId",
    }),

  location: Joi.string().max(200).optional().messages({
    "string.max": "Location cannot exceed 200 characters",
  }),

  timestamp: Joi.date().max("now").optional().messages({
    "date.base": "Timestamp must be a valid date",
    "date.max": "Timestamp cannot be in the future",
  }),
});

// Query parameters validation schema
const orderQuerySchema = Joi.object({
  status: Joi.string()
    .valid(
      "all",
      "Pending",
      "Confirmed",
      "Picked Up",
      "Washing",
      "Ironing",
      "Ready for Pickup",
      "Out for Delivery",
      "Delivered",
      "Cancelled"
    )
    .optional()
    .messages({
      "any.only": 'Status must be one of the allowed values or "all"',
    }),

  serviceType: Joi.string()
    .valid("all", "Wash & Fold", "Dry Clean", "Iron Only", "Premium Wash")
    .optional()
    .messages({
      "any.only": 'Service type must be one of the allowed values or "all"',
    }),

  priority: Joi.string()
    .valid("all", "Low", "Normal", "High", "Urgent")
    .optional()
    .messages({
      "any.only": 'Priority must be one of the allowed values or "all"',
    }),

  page: Joi.number().integer().min(1).max(1000).optional().default(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be a whole number",
    "number.min": "Page must be at least 1",
    "number.max": "Page cannot exceed 1000",
  }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be a whole number",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
    }),

  sortBy: Joi.string()
    .valid(
      "createdAt",
      "updatedAt",
      "status",
      "priority",
      "total",
      "pickup.date"
    )
    .optional()
    .default("createdAt")
    .messages({
      "any.only": "Sort by must be one of the allowed fields",
    }),

  sortOrder: Joi.string()
    .valid("asc", "desc")
    .optional()
    .default("desc")
    .messages({
      "any.only": 'Sort order must be "asc" or "desc"',
    }),

  startDate: Joi.date().optional().messages({
    "date.base": "Start date must be a valid date",
  }),

  endDate: Joi.date().min(Joi.ref("startDate")).optional().messages({
    "date.base": "End date must be a valid date",
    "date.min": "End date must be after start date",
  }),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
  updateOrderPrioritySchema,
  cancelOrderSchema,
  nfcScanSchema,
  orderQuerySchema,
};
